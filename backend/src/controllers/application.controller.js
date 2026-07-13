import mongoose from "mongoose";
import Application from "../models/application.model.js";

const sendNotImplemented = (res, feature) =>
  res.status(501).json({
    success: false,
    message: `${feature} is not implemented yet`,
  });

/**
 * TODO(application): Submit an application for the authenticated volunteer.
 * Body: { opportunityId: string }
 * Success: { success, message, data: application }
 * Rules: derive volunteerId from req.user; reject duplicates, closed/full
 * opportunities, and submissions after the application deadline.
 */
export const createApplication = (req, res) => {
  return sendNotImplemented(res, "Application submission");
};

/**
 * TODO(application): List applications belonging to the authenticated volunteer.
 * Query: { status?: "pending" | "approved" | "rejected" | "withdrawn" }
 * Success: { success, count, data: application[] }
 * When status is omitted, return all of the volunteer's applications.
 */
export const getMyApplications = (req, res) => {
  return sendNotImplemented(res, "Volunteer application listing");
};

/**
 * TODO(application): List applications for one opportunity.
 * Params: { opportunityId: string }
 * Query: { status?: "pending" | "approved" | "rejected" | "withdrawn" }
 * Success: { success, count, data: application[] }
 * Rules: allow only the opportunity-owning organisation or an admin.
 */
export const getOpportunityApplications = (req, res) => {
  return sendNotImplemented(res, "Opportunity application listing");
};

/**
 * TODO(application): Withdraw an application owned by the authenticated volunteer.
 * Params: { id: string }
 * Body: { withdrawalReason: string }
 * Success: { success, message, data: application }
 * Rules: release capacity when withdrawing an approved application.
 */
export const withdrawApplication = (req, res) => {
  return sendNotImplemented(res, "Application withdrawal");
};

export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("volunteerId", "-password")
      .populate("opportunityId");

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (err) {
    console.log("Error in getAllApplications controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    // TODO(application): authorise the applicant, opportunity owner, or admin
    // before returning application details.
    const application = await Application.findById(id)
      .populate("volunteerId", "-password")
      .populate("opportunityId");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (err) {
    console.log("Error in getApplicationById controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findById(id).populate("opportunityId");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // TODO(application): verify opportunity ownership and update capacity
    // atomically before this workflow is considered complete.
    application.status = "approved";
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application approved successfully",
      data: application,
    });
  } catch (err) {
    console.log("Error in approveApplication controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findById(id).populate("opportunityId");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status === "withdrawn") {
      return res.status(400).json({
        success: false,
        message: "Withdrawn application cannot be rejected",
      });
    }

    // TODO(application): verify that the requester owns the linked opportunity.
    application.status = "rejected";
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      data: application,
    });
  } catch (err) {
    console.log("Error in rejectApplication controller: ", err.message);
    res.status(500).json({ 
      message: err.message 
    });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    await Application.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (err) {
    console.log("Error in deleteApplication controller: ", err.message);
    res.status(500).json({ 
      message: err.message 
    });
  }
};
