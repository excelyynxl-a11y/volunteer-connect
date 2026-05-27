import mongoose from "mongoose";
import Application from "../models/application.model.js";
import Opportunity from "../models/opportunity.model.js"

// TODO: implement createApplication() after confirming with client what is required in an Application model
export const createApplication = (req, res) => {
  try {
    // TODO
  } catch (err) {
    console.log("Error in createApplication controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
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

export const completeApplication = async (req, res) => {
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

    if (application.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: `Application cannot be completed. Current status is ${application.status}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Application completion is derived from the opportunity end date",
      data: application,
    });
  } catch (err) {
    console.log("Error in completeApplication controller: ", err.message);
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

export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate application ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    // 2. Fetch the target application
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // 3. Check if application is already approved to prevent double-counting
    if (application.status === "Approved") {
      return res.status(400).json({
        success: false,
        message: "This application has already been approved.",
      });
    }

    // 4. Fetch the linked opportunity to check capacity limits
    const opportunity = await Opportunity.findById(application.opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "The linked opportunity for this application was not found.",
      });
    }

    // AC 1: Block approval if the maximum limit has already been met
    if (opportunity.approvedVolunteersCount >= opportunity.maxVolunteers) {
      return res.status(400).json({
        success: false,
        message: "This opportunity has reached its maximum volunteer capacity.",
      });
    }

    // AC 2: If capacity is below the limit, increment the count safely
    opportunity.approvedVolunteersCount += 1;

    // 5. Save the opportunity first. This triggers the path validation rule 
    // in opportunity.model.js as an absolute guard against race conditions.
    try {
      await opportunity.save();
    } catch (validationError) {
      // Catch path validation errors if parallel requests push the count over maxVolunteers
      return res.status(400).json({
        success: false,
        message: "This opportunity has reached its maximum volunteer capacity.",
      });
    }

    // 6. Update and save the application status now that the slot is secured
    application.status = "Approved";
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application approved successfully.",
      data: {
        application,
        spotsRemaining: Math.max(opportunity.maxVolunteers - opportunity.approvedVolunteersCount, 0),
      },
    });
  } catch (err) {
    console.log("Error in approveApplication controller: ", err.message);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

/**
 * Secondary Requirement: Reject an application and accurately release slot allocations.
 * End-point: PATCH /api/application/:id/reject
 */
export const rejectApplication = async (req, res) => {
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

    if (application.status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "This application has already been rejected.",
      });
    }

    // Clean Counter Management: If an already 'Approved' application is moved to 'Rejected',
    // we must decrement the counter to free up a slot for other pending volunteers.
    if (application.status === "Approved") {
      const opportunity = await Opportunity.findById(application.opportunityId);
      if (opportunity && opportunity.approvedVolunteersCount > 0) {
        opportunity.approvedVolunteersCount -= 1;
        await opportunity.save();
      }
    }

    application.status = "Rejected";
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application rejected successfully.",
      data: application,
    });
  } catch (err) {
    console.log("Error in rejectApplication controller: ", err.message);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};