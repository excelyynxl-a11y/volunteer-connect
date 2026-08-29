import mongoose from "mongoose";
import Opportunity from "../models/opportunity.model.js";
import Report from "../models/report.model.js";
import Application from "../models/application.model.js";
import { User } from "../models/user.model.js";

const REPORT_TYPES = ["UserViolation", "OpportunityViolation"];
const USER_VIOLATION_TYPES = [
  "Last Minute Ghosting",
  "Not Punctual",
  "Poor Work Ethics",
  "Rudeness and Disrespectful",
  "Inappropriate Dress Code",
  "Property Damage",
  "Harassment and Discrimination",
  "Others",
];
const OPPORTUNITY_VIOLATION_TYPES = [
  "Harassment and Discrimination",
  "Security and Crowd Failures",
  "Health and Safety Breaches",
  "Disorganized Schedules",
  "Role Misrepresentation",
  "Lack of Training",
  "Absent Coordination",
  "No Expense Reimbursement as Promised",
  "Inadequate Volunteer Perk as Promised",
  "Hazardous Environment",
  "Mistreatment and Disrespect",
  "Liability and Injury Exposure",
  "Others",
];
const REPORT_TITLE_MAX_LENGTH = 120;
const REPORT_DETAILS_MAX_LENGTH = 2000;
const SAFE_USER_FIELDS = "_id name role avatar";

const populateReport = (query) =>
  query
    .populate("submittedBy", SAFE_USER_FIELDS)
    .populate("reportedUserId", SAFE_USER_FIELDS)
    .populate({
      path: "reportedOpportunityId",
      select: "_id title location startAt endAt status organisationId",
      populate: { path: "organisationId", select: SAFE_USER_FIELDS },
    });

export const getAllReports = async (req, res) => {
  try {
    const reports = await populateReport(Report.find()).sort({ createdAt: -1 });

    res.status(200).json({
      count: reports.length,
      reports
    });
  } catch (err) {
    console.log("Error in getAllReports controller: ", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const userId = req.user._id;

    const reports = await populateReport(
      Report.find({ submittedBy: userId })
    ).sort({ createdAt: -1 });

    res.status(200).json({
      count: reports.length,
      reports
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid report ID."
      });
    }

    const report = await populateReport(Report.findById(id));

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid report ID."
      });
    }

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
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID."
      });
    }

    const validStatuses = ["Pending", "Investigating", "Resolved", "Dismissed"];
    if (typeof status !== "string" || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}.`
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found."
      });
    }

    report.status = status;
    await report.save();

    const updatedReport = await populateReport(Report.findById(id));

    res.status(200).json({
      success: true,
      message: "Report status updated successfully.",
      data: updatedReport
    });
  } catch (err) {
    console.log("Error in updateReportStatus controller: ", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
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

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > REPORT_TITLE_MAX_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: `Report title must be a non-empty string with at most ${REPORT_TITLE_MAX_LENGTH} characters.`
      });
    }

    if (
      typeof details !== "string" ||
      !details.trim() ||
      details.trim().length > REPORT_DETAILS_MAX_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: `Report details must be a non-empty string with at most ${REPORT_DETAILS_MAX_LENGTH} characters.`
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

      if (!USER_VIOLATION_TYPES.includes(userViolationType.trim())) {
        return res.status(400).json({
          success: false,
          message: "Invalid user violation type."
        });
      }

      if (!mongoose.Types.ObjectId.isValid(reportedUserId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reported user ID."
        });
      }

      const reportedUser = await User.findById(reportedUserId).select("_id role");
      if (!reportedUser) {
        return res.status(404).json({
          success: false,
          message: "Reported user not found."
        });
      }

      if (reportedUser.role !== "volunteer") {
        return res.status(400).json({
          success: false,
          message: "Only volunteer accounts can be reported as a user violation."
        });
      }

      if (String(reportedUserId) === String(req.user._id)) {
        return res.status(400).json({
          success: false,
          message: "You cannot report your own account."
        });
      }

      const organisationOpportunityDocs = await Opportunity.find({
        organisationId: req.user._id,
      }).select("_id");
      const organisationOpportunityIds = organisationOpportunityDocs.map(
        (opportunity) => opportunity._id,
      );
      const relatedApplication = await Application.findOne({
        volunteerId: reportedUserId,
        opportunityId: { $in: organisationOpportunityIds },
      }).select("_id");

      if (!relatedApplication) {
        return res.status(403).json({
          success: false,
          message: "You can only report volunteers connected to your opportunities."
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

      if (!OPPORTUNITY_VIOLATION_TYPES.includes(opportunityViolationType.trim())) {
        return res.status(400).json({
          success: false,
          message: "Invalid opportunity violation type."
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

      const relatedApplication = await Application.findOne({
        volunteerId: req.user._id,
        opportunityId: reportedOpportunityId,
      }).select("_id");

      if (!relatedApplication) {
        return res.status(403).json({
          success: false,
          message: "You can only report opportunities you have applied for."
        });
      }

      reportData.opportunityViolationType = opportunityViolationType.trim();
      reportData.reportedOpportunityId = reportedOpportunityId;
    }

    const duplicateReport = await Report.findOne({
      submittedBy: req.user._id,
      reportType,
      ...(reportType === "UserViolation"
        ? { reportedUserId }
        : { reportedOpportunityId }),
      status: { $in: ["Pending", "Investigating"] },
    }).select("_id");

    if (duplicateReport) {
      return res.status(409).json({
        success: false,
        message: "You already have an open report for this target."
      });
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
