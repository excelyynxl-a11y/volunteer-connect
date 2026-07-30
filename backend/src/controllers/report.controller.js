import mongoose from "mongoose";
import Opportunity from "../models/opportunity.model.js";
import Report from "../models/report.model.js";
import { User } from "../models/user.model.js";

const REPORT_TYPES = ["UserViolation", "OpportunityViolation"];

const populateReport = (query) =>
  query
    .populate("submittedBy", "-password")
    .populate("reportedUserId", "-password")
    .populate("reportedOpportunityId");

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("submittedBy", "-password")
      .populate("reportedUserId", "-password")
      .populate("reportedOpportunity");

    res.status(200).json({
      count: reports.length,
      reports
    });
  } catch (err) {
    console.log("Error in getAllReports controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate("submittedBy", "-password")
      .populate("reportedUserId", "-password")
      .populate("reportedOpportunity");

    if (!report) {
      return res.status(404).json({
        message: "Report not found."
      });
    }

    res.status(200).json({
      report
    });
  } catch (err) {
    console.log("Error in getReportById controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found."
      });
    }

    await Report.findByIdAndDelete(id);

    res.status(200).json({
      message: "Report deleted succesfully."
    });
  } catch (err) {
    console.log("Error in deleteReport controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    // TODO
  } catch (err) {
    console.log("Error in updateReportStatus controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const createReport = async (req, res) => {
  try {
    const {
      reportType,
      userViolationType,
      opportunityViolationType,
      title,
      details,
      reportedUserId,
      reportedOpportunityId
    } = req.body;

    if (!REPORT_TYPES.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report type."
      });
    }

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Report title is required."
      });
    }

    if (typeof details !== "string" || !details.trim()) {
      return res.status(400).json({
        success: false,
        message: "Report details are required."
      });
    }

    if (
      req.user.role === "volunteer" &&
      reportType !== "OpportunityViolation"
    ) {
      return res.status(403).json({
        success: false,
        message: "Volunteers can only submit opportunity violation reports."
      });
    }

    if (req.user.role === "organisation" && reportType !== "UserViolation") {
      return res.status(403).json({
        success: false,
        message: "Organisations can only submit user violation reports."
      });
    }

    if (req.user.role !== "volunteer" && req.user.role !== "organisation") {
      return res.status(403).json({
        success: false,
        message: "Your account cannot submit reports."
      });
    }

    const reportData = {
      submittedBy: req.user._id,
      reportType,
      title: title.trim(),
      details: details.trim()
    };

    if (reportType === "UserViolation") {
      if (typeof userViolationType !== "string" || !userViolationType.trim()) {
        return res.status(400).json({
          success: false,
          message: "User violation type is required."
        });
      }

      if (!mongoose.Types.ObjectId.isValid(reportedUserId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reported user ID."
        });
      }

      const reportedUser = await User.findById(reportedUserId).select("_id");
      if (!reportedUser) {
        return res.status(404).json({
          success: false,
          message: "Reported user not found."
        });
      }

      reportData.userViolationType = userViolationType.trim();
      reportData.reportedUserId = reportedUserId;
    } else {
      if (
        typeof opportunityViolationType !== "string" ||
        !opportunityViolationType.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Opportunity violation type is required."
        });
      }

      if (!mongoose.Types.ObjectId.isValid(reportedOpportunityId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reported opportunity ID."
        });
      }

      const reportedOpportunity = await Opportunity.findById(
        reportedOpportunityId
      ).select("_id");
      if (!reportedOpportunity) {
        return res.status(404).json({
          success: false,
          message: "Reported opportunity not found."
        });
      }

      reportData.opportunityViolationType = opportunityViolationType.trim();
      reportData.reportedOpportunityId = reportedOpportunityId;
    }

    const newReport = await Report.create(reportData);
    const populatedReport = await populateReport(
      Report.findById(newReport._id)
    );

    res.status(201).json({
      success: true,
      message: "Report created successfully.",
      data: populatedReport
    });
  } catch (err) {
    console.log("Error in createReport controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
};
