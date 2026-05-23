import { Volunteer } from "../models/user.model.js";
import Application from "../models/application.model.js";
import mongoose from "mongoose";

const validAgeGroups = ["21-30", "31-40", "41-50", "51-60", "60+"];

const validDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const validAvailabilityPreferences = ["available", "preferred"];

const time24HourRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const getMinutesFromTime = (timeValue) => {
  const [hours, minutes] = timeValue.split(":").map(Number);
  return hours * 60 + minutes;
};

const normalizeSkills = (skills) => {
  return [
    ...new Set(
      skills
        .map((skill) => String(skill).trim())
        .filter(Boolean),
    ),
  ];
};

const normalizeAvailability = (availability) => {
  return availability.map((slot) => ({
    dayOfWeek: slot.dayOfWeek,
    startTime: String(slot.startTime).trim(),
    endTime: String(slot.endTime).trim(),
    preference: slot.preference || "available",
  }));
};

const isValidAvailabilitySlot = (slot) => {
  if (
    !(
      slot &&
      validDays.includes(slot.dayOfWeek) &&
      typeof slot.startTime === "string" &&
      typeof slot.endTime === "string" &&
      time24HourRegex.test(slot.startTime.trim()) &&
      time24HourRegex.test(slot.endTime.trim()) &&
      validAvailabilityPreferences.includes(slot.preference || "available")
    )
  ) {
    return false;
  }

  return (
    getMinutesFromTime(slot.startTime.trim()) <
    getMinutesFromTime(slot.endTime.trim())
  );
};

// Get all volunteers (Admin only)
export const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().select("-password");

    res.status(200).json({
      success: true,
      count: volunteers.length,
      data: volunteers,
    });
  } catch (err) {
    console.log("Error in getVolunteers controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
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

    // Get one volunteer profile only
    const volunteer = await Volunteer.findById(id).select(
      "name email avatar ageGroup resume biodata skills availability approvalStatus"
    );

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid volunteer ID",
      });
    }

    if (
      fullName === undefined &&
      ageGroup === undefined &&
      biodata === undefined &&
      skills === undefined &&
      availability === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one profile field must be provided",
      });
    }

    if (fullName !== undefined && fullName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Full name cannot be empty",
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

    if (skills !== undefined && !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array",
      });
    }

    const normalizedSkills =
      skills !== undefined ? normalizeSkills(skills) : undefined;

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

    if (availability !== undefined && !Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        message: "Availability must be an array",
      });
    }

    const normalizedAvailability =
      availability !== undefined ? normalizeAvailability(availability) : undefined;

    if (
      normalizedAvailability !== undefined &&
      !normalizedAvailability.every(isValidAvailabilitySlot)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Each availability slot must include a valid dayOfWeek, startTime, endTime, and preference",
      });
    }

    const volunteer = await Volunteer.findById(id);

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
      volunteer.availability = normalizedAvailability;
    }

    await volunteer.save();

    const updatedVolunteer = await Volunteer.findById(id).select("-password");

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

    const volunteer = await Volunteer.findById(id).select("-password");

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    const approvedApplications = await Application.find({
      volunteerId: id,
      status: "approved",
    }).populate({
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
