import { Volunteer } from "../models/user.model.js";
import Application from "../models/application.model.js";
import Opportunity from "../models/opportunity.model.js";
import mongoose from "mongoose";
import { uploadAvatarToCloudinary } from "../services/cloudinary.service.js";
import {
  getAvailabilityValidationError,
  normalizeAvailability,
  sortAvailability,
} from "../lib/availability.js";
import {
  normalizeSkills,
  parseArrayField,
  validAgeGroups,
} from "../lib/volunteer.js";

const OWNER_PROFILE_FIELDS =
  "_id name email avatar ageGroup resume biodata skills availability approvalStatus";
const ORGANISATION_PROFILE_FIELDS =
  "_id name avatar ageGroup resume biodata skills availability";

const canViewVolunteerProfile = async (req, volunteerId) => {
  if (req.user.role === "admin") return true;
  if (req.user.role === "volunteer") {
    return String(req.user._id) === volunteerId;
  }

  if (req.user.role !== "organisation") return false;

  const organisationOpportunityIds = await Opportunity.find({
    organisationId: req.user._id,
  }).select("_id");
  const opportunityIds = organisationOpportunityIds.map((opportunity) => opportunity._id);

  if (!opportunityIds.length) return false;

  return Boolean(
    await Application.exists({
      volunteerId,
      opportunityId: { $in: opportunityIds },
      status: { $in: ["pending", "approved"] },
    }),
  );
};

// Get volunteer profile
export const getVolunteerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID format is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid volunteer ID",
      });
    }

    if (!(await canViewVolunteerProfile(req, id))) {
      return res.status(403).json({
        success: false,
        message: "You are not authorised to view this volunteer profile",
      });
    }

    const profileFields =
      req.user.role === "volunteer" && String(req.user._id) === id
        ? OWNER_PROFILE_FIELDS
        : ORGANISATION_PROFILE_FIELDS;
    const volunteer = await Volunteer.findOne({ _id: id, deletedAt: null }).select(profileFields);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: volunteer,
    });
  } catch (err) {
    console.log("Error in getVolunteerProfile controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Update volunteer profile
export const updateVolunteerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, ageGroup, biodata, skills, availability } = req.body;
    const parsedSkills = parseArrayField(skills);
    const parsedAvailability = parseArrayField(availability);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid volunteer ID",
      });
    }

    if (String(req.user._id) !== id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile",
      });
    }

    if (
      fullName === undefined &&
      ageGroup === undefined &&
      biodata === undefined &&
      parsedSkills === undefined &&
      parsedAvailability === undefined &&
      !req.file
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one profile field must be provided",
      });
    }

    if (
      fullName !== undefined &&
      (typeof fullName !== "string" || !fullName.trim() || fullName.trim().length > 120)
    ) {
      return res.status(400).json({
        success: false,
        message: "Full name must be a non-empty string with at most 120 characters",
      });
    }

    if (ageGroup !== undefined && !validAgeGroups.includes(ageGroup)) {
      return res.status(400).json({
        success: false,
        message: "Invalid age group",
      });
    }

    if (
      biodata !== undefined &&
      (typeof biodata !== "string" || biodata.trim().length > 1000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Biodata must be a string with at most 1000 characters",
      });
    }

    if (parsedSkills !== undefined && !Array.isArray(parsedSkills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array",
      });
    }

    const normalizedSkills =
      parsedSkills !== undefined ? normalizeSkills(parsedSkills) : undefined;

    if (normalizedSkills !== undefined && normalizedSkills.length > 20) {
      return res.status(400).json({
        success: false,
        message: "A volunteer can have at most 20 skills",
      });
    }

    if (
      normalizedSkills !== undefined &&
      normalizedSkills.some((skill) => skill.length > 50)
    ) {
      return res.status(400).json({
        success: false,
        message: "Each skill must be at most 50 characters",
      });
    }

    if (parsedAvailability !== undefined && !Array.isArray(parsedAvailability)) {
      return res.status(400).json({
        success: false,
        message: "Availability must be an array",
      });
    }

    const normalizedAvailability =
      parsedAvailability !== undefined
        ? normalizeAvailability(parsedAvailability)
        : undefined;
    const availabilityValidationError =
      normalizedAvailability !== undefined
        ? getAvailabilityValidationError(normalizedAvailability)
        : "";

    if (availabilityValidationError) {
      return res.status(400).json({
        success: false,
        message: availabilityValidationError,
      });
    }

    const volunteer = await Volunteer.findOne({ _id: id, deletedAt: null });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    if (fullName !== undefined) {
      volunteer.name = fullName.trim();
    }

    if (ageGroup !== undefined) {
      volunteer.ageGroup = ageGroup;
    }

    if (biodata !== undefined) {
      volunteer.biodata = biodata.trim();
    }

    if (normalizedSkills !== undefined) {
      volunteer.skills = normalizedSkills;
    }

    if (normalizedAvailability !== undefined) {
      volunteer.availability = sortAvailability(normalizedAvailability);
    }

    if (req.file) {
      volunteer.avatar = await uploadAvatarToCloudinary(req.file.buffer);
    }

    await volunteer.save();

    const updatedVolunteer = await Volunteer.findOne({ _id: id, deletedAt: null }).select(OWNER_PROFILE_FIELDS);

    res.status(200).json({
      success: true,
      message: "Volunteer profile updated successfully",
      data: updatedVolunteer,
    });
  } catch (err) {
    console.log("Error in updateVolunteerProfile controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get volunteer past experience
export const getVolunteerPastExperience = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid volunteer ID",
      });
    }

    const volunteer = await Volunteer.findOne({ _id: id, deletedAt: null }).select("_id");

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    if (!(await canViewVolunteerProfile(req, id))) {
      return res.status(403).json({
        success: false,
        message: "You are not authorised to view this volunteer history",
      });
    }

    const experienceQuery = {
      volunteerId: id,
      status: "approved",
    };

    if (req.user.role === "organisation") {
      const organisationOpportunityIds = await Opportunity.find({
        organisationId: req.user._id,
      }).select("_id");
      experienceQuery.opportunityId = {
        $in: organisationOpportunityIds.map((opportunity) => opportunity._id),
      };
    }

    const approvedApplications = await Application.find(experienceQuery).populate({
      path: "opportunityId",
      match: { endAt: { $lt: new Date() } },
      populate: {
        path: "organisationId",
        select: "name",
      },
    });

    const pastExperience = approvedApplications.filter(
      (application) => application.opportunityId,
    );

    res.status(200).json({
      success: true,
      volunteerId: id,
      count: pastExperience.length,
      data: pastExperience,
    });
  } catch (err) {
    console.log("Error in getVolunteerPastExperience controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
};
