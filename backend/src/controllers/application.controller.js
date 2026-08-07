import mongoose from "mongoose";
import Application from "../models/application.model.js";
import Opportunity from "../models/opportunity.model.js";

const sendNotImplemented = (res, feature) =>
  res.status(501).json({
    success: false,
    message: `${feature} is not implemented yet`,
  });

/**
 * TODO(application): Submit an application for the authenticated volunteer.
 * Body: { opportunityId: string }
 * Success: { success, message, data: application }
 * Rules: derive volunteerId from req.user; reject any existing application for
 * the same volunteer/opportunity pair, non-active or full opportunities, and
 * submissions after the application deadline.
 */
export const createApplication = async (req, res) => {
  try {
    const { opportunityId } = req.body;
    const volunteerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity ID",
      });
    }

    // 1. Check if opportunity exists and validate status & deadline
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    if (opportunity.status?.toLowerCase() !== "active") {
      return res.status(400).json({
        success: false,
        message: "This opportunity is not currently active for applications",
      });
    }

    if (opportunity.applicationDeadline && new Date() > new Date(opportunity.applicationDeadline)) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed",
      });
    }

    if (
      opportunity.maxVolunteers &&
      opportunity.currentVolunteers >= opportunity.maxVolunteers
    ) {
      return res.status(400).json({
        success: false,
        message: "Opportunity has reached full capacity",
      });
    }

    // 2. Prevent duplicate applications
    const existingApplication = await Application.findOne({
      volunteerId,
      opportunityId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this opportunity",
      });
    }

    // 3. Create application
    const application = await Application.create({
      volunteerId,
      opportunityId,
      status: "pending",
    });

    // 4. Populate opportunity AND organisationId before returning
    const populatedApplication = await Application.findById(application._id)
      .populate("volunteerId", "-password")
      .populate({
        path: "opportunityId",
        populate: {
          path: "organisationId", // Nested populate gives the frontend organisation details
        },
      });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: populatedApplication,
    });
  } catch (err) {
    console.log("Error in createApplication controller: ", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * TODO(application): List applications belonging to the authenticated volunteer.
 * Query: { status?: "pending" | "approved" | "rejected" | "withdrawn" }
 * Success: { success, count, data: application[] }
 * When status is omitted, return all of the volunteer's applications.
 */
export const getMyApplications = async (req, res) => {
  try {
    const volunteerId = req.user._id;
    const { status } = req.query;
    const query = { volunteerId };

    if (status) query.status = status.toLowerCase();

    const applications = await Application.find(query)
      .populate({
        path: "opportunityId",
        populate: { path: "organisationId" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * TODO(application): List applications received by the authenticated organisation.
 * Query: {
 *   status?: "pending" | "approved" | "rejected" | "withdrawn",
 *   opportunityId?: string
 * }
 * Success: { success, count, data: application[] }
 * Rules: return applications only for opportunities owned by req.user. When
 * opportunityId is omitted, return applications across all owned opportunities.
 */
export const getMyOrganisationApplications = (req, res) => {
  return sendNotImplemented(res, "Organisation application listing");
};

/**
 * TODO(application): Withdraw an application owned by the authenticated volunteer.
 * Params: { id: string }
 * Body: { withdrawalReason: string }
 * Success: { success, message, data: application }
 * Rules: allow only the applicant; pending and approved applications can be
 * withdrawn; release capacity atomically when withdrawing an approved
 * application; rejected and withdrawn applications are terminal.
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

    // TODO(application): allow only the opportunity-owning organisation,
    // require pending status, reserve capacity atomically, and prevent approval
    // when the opportunity is full. Admins cannot approve applications.
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

    // TODO(application): allow only the opportunity-owning organisation and
    // require pending status. Rejected applications are terminal and cannot be
    // changed back to approved. Admins cannot reject applications.
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
