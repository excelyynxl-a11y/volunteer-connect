import mongoose from "mongoose";
import Opportunity from "../models/opportunity.model.js";

// TODO: update createOpportunity() after verifying with client what are required in createOpportunity
export const createOpportunity = async (req, res) => {

  try {
    const { title, details, maxVolunteers, fixedDate, timeFrame, startAt, endAt, applicationDeadline, location } = req.body;

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

    // maxVolunteer cannot be empty
    if (maxVolunteers === undefined || maxVolunteers === null) {
      return res.status(400).json({
        success: false,
        message: "Max volunteers is required",
      });
    }

    // maxVolunteer must a positive number
    if (
      typeof maxVolunteers !== "number" ||
      maxVolunteers < 1 ||
      !Number.isInteger(maxVolunteers)
    ) {
      return res.status(400).json({
        success: false,
        message: "Max volunteers must be a positive integer",
      });
    }

    // fixedDate cannot be empty
    if (!fixedDate) {
      return res.status(400).json({
        success: false,
        message: "Fixed date is required",
      });
    }

    // fixedDate must be valid date format
    const parsedDate = new Date(fixedDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid fixed date format",
      });
    }

    // fixedDate cannot be before today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fixedDateOnly = new Date(parsedDate);
    fixedDateOnly.setHours(0, 0, 0, 0);
    if (fixedDateOnly < today) {
      return res.status(400).json({
        success: false,
        message: "Fixed date cannot be before today",
      });
    }

    // timeFrame cannot empty
    if (!timeFrame || timeFrame.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Time frame is required",
      });
    }

    const newOpportunity = new Opportunity({
  title: title.trim(),
  details: details.trim(),
  maxVolunteers,
  fixedDate: parsedDate,
  timeFrame: timeFrame.trim(),
  organisationId: req.user._id,
  startAt,
  endAt,
  applicationDeadline,
  location,
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
    const opportunities = await Opportunity.find();

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

    const opportunity = await Opportunity.findById(id);

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

// TODO: update createOpportunity() after verifying with client what are required in createOpportunity
export const updateOpportunity = async (req, res) => {

  try {
    const { id } = req.params;
    const { title, details, maxVolunteers, fixedDate, timeFrame, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity ID",
      });
    }

    if (
      title === undefined &&
      details === undefined &&
      maxVolunteers === undefined &&
      fixedDate === undefined &&
      timeFrame === undefined &&
      status === undefined
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

    // maxVolunteers cannot be empty, must be an integer
    if (maxVolunteers !== undefined) {
      if (typeof maxVolunteers !== "number" || !Number.isInteger(maxVolunteers)) {
        return res.status(400).json({
          success: false,
          message: "Max volunteers must be a integer number",
        });
      }
      if (
        maxVolunteers < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Max volunteers must be a positive integer",
        });
      }
    }

    // fixedDate cannot be empty, must be of valid date format
    if (fixedDate !== undefined) {
      const parsedDate = new Date(fixedDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid fixed date format",
        });
      }

      // fixedDate cannot be before today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fixedDateOnly = new Date(parsedDate);
      fixedDateOnly.setHours(0, 0, 0, 0);
      if (fixedDateOnly < today) {
        return res.status(400).json({
          success: false,
          message: "Fixed date cannot be before today",
        });
      }
    }

    // timeFrame cannot be empty
    if (timeFrame !== undefined && timeFrame.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Time frame cannot be empty",
      });
    }

    // status cannot be empty, must be of either [active, closed, cancelled]
    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of: Active, Closed, Cancelled",
      });
    }

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
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

    if (maxVolunteers !== undefined) {
      opportunity.maxVolunteers = maxVolunteers;
    }

    if (fixedDate !== undefined) {
      opportunity.fixedDate = new Date(fixedDate);
    }

    if (timeFrame !== undefined) {
      opportunity.timeFrame = timeFrame.trim();
    }

    if (status !== undefined) {
      opportunity.status = status;
    }

    await opportunity.save();

    res.status(200).json({
      success: true,
      message: "Opportunity updated successfully",
      data: opportunity,
    });
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