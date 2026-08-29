import mongoose from "mongoose";
import Opportunity, {
  OPPORTUNITY_CATEGORIES,
  OPPORTUNITY_STATUSES,
} from "../models/opportunity.model.js";

import { notifyFollowersOfNewOpportunity } from "../lib/email.js";


const STRING_LIMITS = {
  title: 120,
  details: 5000,
  location: 300,
  requirements: 2000,
};

const normalizeStringArray = (value) => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return null;
  if (value.some((item) => typeof item !== "string")) return null;

  return [...new Set(value.map((item) => item.trim()).filter(Boolean))];
};

const isValidHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isValidationError = (error) =>
  error.name === "ValidationError" || error.name === "CastError";

export const createOpportunity = async (req, res) => {

  try {
    const {
      title,
      details,
      maxVolunteers,
      startAt,
      endAt,
      applicationDeadline,
      location,
      category,
      requirements,
      images,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > STRING_LIMITS.title
    ) {
      return res.status(400).json({
        success: false,
        message: `Title must be a non-empty string with at most ${STRING_LIMITS.title} characters`,
      });
    }

    if (
      typeof details !== "string" ||
      !details.trim() ||
      details.trim().length > STRING_LIMITS.details
    ) {
      return res.status(400).json({
        success: false,
        message: `Details must be a non-empty string with at most ${STRING_LIMITS.details} characters`,
      });
    }

    if (
      typeof location !== "string" ||
      !location.trim() ||
      location.trim().length > STRING_LIMITS.location
    ) {
      return res.status(400).json({
        success: false,
        message: `Location must be a non-empty string with at most ${STRING_LIMITS.location} characters`,
      });
    }

    if (maxVolunteers === undefined || maxVolunteers === null) {
      return res.status(400).json({
        success: false,
        message: "Max volunteers is required",
      });
    }

    const parsedMaxVolunteers = Number(maxVolunteers);
    if (
      !Number.isInteger(parsedMaxVolunteers) ||
      parsedMaxVolunteers < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Max volunteers must be a positive integer",
      });
    }

    if (!startAt || !endAt || !applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: "Start time, end time, and application deadline are required",
      });
    }

    const parsedStartAt = new Date(startAt);
    const parsedEndAt = new Date(endAt);
    const parsedApplicationDeadline = new Date(applicationDeadline);

    if (
      isNaN(parsedStartAt.getTime()) ||
      isNaN(parsedEndAt.getTime()) ||
      isNaN(parsedApplicationDeadline.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity date format",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateOnly = new Date(parsedStartAt);
    startDateOnly.setHours(0, 0, 0, 0);
    if (startDateOnly < today) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be before today",
      });
    }

    if (parsedEndAt <= parsedStartAt) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    if (parsedApplicationDeadline >= parsedStartAt) {
      return res.status(400).json({
        success: false,
        message: "Application deadline must be before start time",
      });
    }

    const normalizedCategory = normalizeStringArray(category);
    if (normalizedCategory === null) {
      return res.status(400).json({
        success: false,
        message: "Category must be an array",
      });
    }

    if (
      normalizedCategory?.some(
        (item) => !OPPORTUNITY_CATEGORIES.includes(item),
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Category contains an unsupported value",
      });
    }

    if (
      requirements !== undefined &&
      (typeof requirements !== "string" ||
        requirements.trim().length > STRING_LIMITS.requirements)
    ) {
      return res.status(400).json({
        success: false,
        message: "Requirements must be a string with at most 2000 characters",
      });
    }

    const normalizedImages = normalizeStringArray(images);
    if (normalizedImages === null) {
      return res.status(400).json({
        success: false,
        message: "Images must be an array",
      });
    }


    if (normalizedImages?.some((image) => !isValidHttpUrl(image))) {
      return res.status(400).json({
        success: false,
        message: "Images must contain valid HTTP or HTTPS URLs",
      });
    }

    const newOpportunity = new Opportunity({
      title: title.trim(),
      details: details.trim(),
      location: location.trim(),
      startAt: parsedStartAt,
      endAt: parsedEndAt,
      applicationDeadline: parsedApplicationDeadline,
      maxVolunteers: parsedMaxVolunteers,
      category: normalizedCategory ?? [],
      requirements: requirements !== undefined ? requirements.trim() : "",
      images: normalizedImages ?? [],
      organisationId: req.user._id,
    });

    await newOpportunity.save();
    void notifyFollowersOfNewOpportunity(newOpportunity, req.user);

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
      data: newOpportunity,
    });
  } catch (err) {
    console.log("Error in createOpportunity controller: ", err.message);
    res.status(isValidationError(err) ? 400 : 500).json({ 
      success: false,
      message: isValidationError(err) ? err.message : "Internal Server Error",
    });
  }
};

export const getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ deletedAt: null })
      .populate("organisationId", "name")
      .sort({ publishedAt: -1 });

    // const opportunities = await Opportunity.find({ status: "active" });
    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (err) {
    console.log("Error in getAllOpportunities controller: ", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity ID",
      });
    }

    const opportunity = await Opportunity.findOne({ _id: id, deletedAt: null })
      .populate("organisationId", "name");

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    res.status(200).json({
      success: true,
      data: opportunity,
    });
  } catch (err) {
    console.log("Error in getOpportunityById controller: ", err.message);
    res.status(500).json({ 
      message: err.message 
    });
  }
};

export const updateOpportunity = async (req, res) => {

  try {
    const { id } = req.params;
    const {
      title,
      details,
      maxVolunteers,
      status,
      category,
      location,
      startAt,
      endAt,
      applicationDeadline,
      requirements,
      images,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity ID",
      });
    }

    if (
      title === undefined &&
      details === undefined &&
      location === undefined &&
      maxVolunteers === undefined &&
      startAt === undefined &&
      endAt === undefined &&
      applicationDeadline === undefined &&
      status === undefined &&
      category === undefined &&
      requirements === undefined &&
      images === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one field must be provided",
      });
    }

    if (
      title !== undefined &&
      (typeof title !== "string" ||
        !title.trim() ||
        title.trim().length > STRING_LIMITS.title)
    ) {
      return res.status(400).json({
        success: false,
        message: `Title must be a non-empty string with at most ${STRING_LIMITS.title} characters`,
      });
    }

    if (
      details !== undefined &&
      (typeof details !== "string" ||
        !details.trim() ||
        details.trim().length > STRING_LIMITS.details)
    ) {
      return res.status(400).json({
        success: false,
        message: `Details must be a non-empty string with at most ${STRING_LIMITS.details} characters`,
      });
    }

    if (
      location !== undefined &&
      (typeof location !== "string" ||
        !location.trim() ||
        location.trim().length > STRING_LIMITS.location)
    ) {
      return res.status(400).json({
        success: false,
        message: `Location must be a non-empty string with at most ${STRING_LIMITS.location} characters`,
      });
    }

    if (maxVolunteers !== undefined) {
      const parsedMaxVolunteers = Number(maxVolunteers);
      if (!Number.isInteger(parsedMaxVolunteers)) {
        return res.status(400).json({
          success: false,
          message: "Max volunteers must be an integer number",
        });
      }
      if (parsedMaxVolunteers < 1) {
        return res.status(400).json({
          success: false,
          message: "Max volunteers must be a positive integer",
        });
      }
    }

    const parsedStartAt = startAt !== undefined ? new Date(startAt) : undefined;
    const parsedEndAt = endAt !== undefined ? new Date(endAt) : undefined;
    const parsedApplicationDeadline =
      applicationDeadline !== undefined ? new Date(applicationDeadline) : undefined;

    if (
      (parsedStartAt && isNaN(parsedStartAt.getTime())) ||
      (parsedEndAt && isNaN(parsedEndAt.getTime())) ||
      (parsedApplicationDeadline && isNaN(parsedApplicationDeadline.getTime()))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity date format",
      });
    }

    const opportunity = await Opportunity.findOne({ _id: id, deletedAt: null });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    if (
      ["completed", "cancelled"].includes(opportunity.status) &&
      status !== undefined &&
      status !== opportunity.status
    ) {
      return res.status(400).json({
        success: false,
        message: "Completed and cancelled opportunities cannot be reopened",
      });
    }

    const nextStatus = status ?? opportunity.status;
    if (parsedStartAt) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDateOnly = new Date(parsedStartAt);
      startDateOnly.setHours(0, 0, 0, 0);
      if (startDateOnly < today && !["completed", "cancelled"].includes(nextStatus)) {
        return res.status(400).json({
          success: false,
          message: "Start date cannot be before today",
        });
      }
    }

    if (status !== undefined && !OPPORTUNITY_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of: active, closed, cancelled, completed",
      });
    }

    const normalizedCategory = normalizeStringArray(category);
    if (normalizedCategory === null) {
      return res.status(400).json({
        success: false,
        message: "Category must be an array",
      });
    }

    if (
      normalizedCategory?.some(
        (item) => !OPPORTUNITY_CATEGORIES.includes(item),
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Category contains an unsupported value",
      });
    }

    if (
      requirements !== undefined &&
      (typeof requirements !== "string" ||
        requirements.trim().length > STRING_LIMITS.requirements)
    ) {
      return res.status(400).json({
        success: false,
        message: "Requirements must be a string with at most 2000 characters",
      });
    }

    const normalizedImages = normalizeStringArray(images);
    if (normalizedImages === null) {
      return res.status(400).json({
        success: false,
        message: "Images must be an array",
      });
    }


    if (normalizedImages?.some((image) => !isValidHttpUrl(image))) {
      return res.status(400).json({
        success: false,
        message: "Images must contain valid HTTP or HTTPS URLs",
      });
    }

    if (
      maxVolunteers !== undefined &&
      Number(maxVolunteers) < opportunity.approvedVolunteersCount
    ) {
      return res.status(400).json({
        success: false,
        message: "Max volunteers cannot be lower than the approved volunteer count",
      });
    }

    const nextStartAt = parsedStartAt ?? opportunity.startAt;
    const nextEndAt = parsedEndAt ?? opportunity.endAt;
    const nextApplicationDeadline =
      parsedApplicationDeadline ?? opportunity.applicationDeadline;

    if (nextEndAt <= nextStartAt) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    if (nextApplicationDeadline >= nextStartAt) {
      return res.status(400).json({
        success: false,
        message: "Application deadline must be before start time",
      });
    }

    // Only the owning organisation or an admin can update
    if (
      opportunity.organisationId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this opportunity",
      });
    }

    if (title !== undefined) {
      opportunity.title = title.trim();
    }

    if (details !== undefined) {
      opportunity.details = details.trim();
    }

    if (location !== undefined) {
      opportunity.location = location.trim();
    }

    if (normalizedCategory !== undefined) {
      opportunity.category = normalizedCategory;
    }

    if (maxVolunteers !== undefined) {
      opportunity.maxVolunteers = Number(maxVolunteers);
    }

    if (startAt !== undefined) {
      opportunity.startAt = parsedStartAt;
    }

    if (endAt !== undefined) {
      opportunity.endAt = parsedEndAt;
    }

    if (applicationDeadline !== undefined) {
      opportunity.applicationDeadline = parsedApplicationDeadline;
    }

    if (status !== undefined) {
      opportunity.status = status;
    }

    if (requirements !== undefined) {
      opportunity.requirements = requirements.trim();
    }

    if (normalizedImages !== undefined) {
      opportunity.images = normalizedImages;
    }

    await opportunity.save();

    res.status(200).json({
      success: true,
      message: "Opportunity updated successfully",
      data: opportunity,
    });
  } catch (err) {
    console.log("Error in updateOpportunity controller: ", err.message);
    res.status(isValidationError(err) ? 400 : 500).json({ 
      success: false,
      message: isValidationError(err) ? err.message : "Internal Server Error",
    });
  }
};

export const deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity ID",
      });
    }

    const opportunity = await Opportunity.findOne({ _id: id, deletedAt: null });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    opportunity.status = "cancelled";
    opportunity.deletedAt = new Date();
    await opportunity.save();

    res.status(200).json({
      success: true,
      message: "Opportunity deleted successfully",
    });
  } catch (err) {
    console.log("Error in deleteOpportunity controller: ", err.message);
    res.status(500).json({ 
      message: err.message 
    });
  }
};

export const getOrganisationOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({
      organisationId: req.user._id,
      deletedAt: null,
    });

    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (err) {
    console.log("Error in getOrganisationOpportunities controller: ", err.message);
    res.status(500).json({ 
      message: err.message 
    });
  }
};
