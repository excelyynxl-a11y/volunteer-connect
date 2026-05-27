import mongoose from "mongoose";
import Opportunity from "../models/opportunity.model.js";

const validStatuses = ["active", "closed", "cancelled", "completed"];

export const createOpportunity = async (req, res) => {

  try {
    const { title, details, maxVolunteers, fixedDate, timeFrame, startAt, endAt, applicationDeadline, location, category } = req.body;

    if (req.user.role !== "organisation") {
      return res.status(403).json({
        success: false,
        message: "Only organisations can create opportunities",
      });
    }

    // title cannot be empty
    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // details cannot be empty
    if (!details || details.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Details are required",
      });
    }

    if (!location || location.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Location is required",
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

    const newOpportunity = new Opportunity({
      title: title.trim(),
      details: details.trim(),
      location: location.trim(),
      startAt: parsedStartAt,
      endAt: parsedEndAt,
      applicationDeadline: parsedApplicationDeadline,
      maxVolunteers: parsedMaxVolunteers,
      category,
      requirements: requirements ? requirements.trim() : undefined,
      images,
      fixedDate: parsedDate,
      timeFrame: timeFrame ? timeFrame.trim() : undefined,
      organisationId: req.user._id,
    });

    await newOpportunity.save();

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
      data: newOpportunity,
    });
  } catch (err) {
    console.log("Error in createOpportunity controller: ", err.message);
    res.status(500).json({ 
      message: err.message 
    });
  }
};

export const getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
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
      message: err.message 
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

    const opportunity = await Opportunity.findById(id)
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
    const { title, details, maxVolunteers, fixedDate, timeFrame, status, category, location, startAt, endAt, applicationDeadline } = req.body;
    const validStatuses = ["active", "closed", "cancelled", "completed"];

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

    // title cannot be empty
    if (title !== undefined && title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty",
      });
    }

    // details cannot be empty
    if (details !== undefined && details.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Details cannot be empty",
      });
    }

    if (location !== undefined && location.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Location cannot be empty",
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

    if (parsedStartAt) {
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
    }

    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of: active, closed, cancelled, completed",
      });
    }

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
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

    if (category !== undefined) {
      opportunity.category = category;
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

    if (images !== undefined) {
      opportunity.images = images;
    }

    await opportunity.save();

    res.status(200).json({
      success: true,
      message: "Opportunity updated successfully",
      data: opportunity,
    });
  } 
  } catch (err) {
    console.log("Error in updateOpportunity controller: ", err.message);
    res.status(500).json({ 
      message: err.message 
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

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    await Opportunity.findByIdAndDelete(id);

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
    if (req.user.role !== "organisation") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Authorised for organisations only.",
      });
    }

    const opportunities = await Opportunity.find({ organisationId: req.user._id });

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
