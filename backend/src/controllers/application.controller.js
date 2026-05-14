import mongoose from "mongoose";
import Application from "../models/application.model.js";

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

    application.status = "Approved";
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

    // completed applications cannot be rejected
    if (application.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Completed application cannot be rejected",
      });
    }

    application.status = "Rejected";
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

    // only Approved applications can be marked as completed
    if (application.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: `Application cannot be completed. Current status is ${application.status}`,
      });
    }

    application.status = "Completed";
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application completed successfully",
      data: application,
    });
  } catch (err) {
    console.log("Error in completeApplication controller: ", err.message);
    res.status(500).json({ 
      message: err.message 
    });
  }
};
