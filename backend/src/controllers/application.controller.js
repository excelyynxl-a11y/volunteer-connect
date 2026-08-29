import mongoose from "mongoose";
import Application from "../models/application.model.js";
import Opportunity from "../models/opportunity.model.js";
import { isOpportunityInsideAvailability } from "../lib/availability.js";
import { sendApplicationStatusEmail } from "../lib/email.js";

const APPLICATION_STATUSES = ["pending", "approved", "rejected", "withdrawn"];
const SAFE_VOLUNTEER_FIELDS = "_id name role avatar skills availability";
const SAFE_ORGANISATION_FIELDS = "_id name role avatar";
const SAFE_OPPORTUNITY_FIELDS =
  "_id title details location startAt endAt applicationDeadline maxVolunteers approvedVolunteersCount category requirements status publishedAt organisationId";

const isValidStatus = (status) =>
  typeof status === "string" && APPLICATION_STATUSES.includes(status.toLowerCase());

const toStatus = (status) => status.toLowerCase();

const isSameId = (left, right) => String(left) === String(right);

const populateApplication = (query) =>
  query
    .populate("volunteerId", SAFE_VOLUNTEER_FIELDS)
    .populate({
      path: "opportunityId",
      select: SAFE_OPPORTUNITY_FIELDS,
      populate: {
        path: "organisationId",
        select: SAFE_ORGANISATION_FIELDS,
      },
    });

const getApplicationWithOpportunity = (id) =>
  Application.findById(id).populate({
    path: "opportunityId",
    select: "_id organisationId maxVolunteers approvedVolunteersCount status",
  });

const sendStatusEmailSafely = (application, status) => {
  void sendApplicationStatusEmail(application, status).catch((error) => {
    console.error("Application status email failed:", error.message);
  });
};

const getOrganisationOwnedApplication = async (id, organisationId) => {
  const application = await getApplicationWithOpportunity(id);

  if (!application) {
    return { application: null, error: { status: 404, message: "Application not found" } };
  }

  if (
    !application.opportunityId ||
    !isSameId(application.opportunityId.organisationId, organisationId)
  ) {
    return {
      application: null,
      error: { status: 403, message: "You can only manage applications for your own opportunities" },
    };
  }

  return { application, error: null };
};

const releaseApprovedSlot = async (opportunityId) =>
  Opportunity.findOneAndUpdate(
    { _id: opportunityId, approvedVolunteersCount: { $gt: 0 } },
    { $inc: { approvedVolunteersCount: -1 } },
    { new: true },
  );

/** Submit an application for the authenticated volunteer. */
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

    const opportunity = await Opportunity.findOne({ _id: opportunityId, deletedAt: null });
    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    if (opportunity.status?.toLowerCase() !== "active") {
      return res.status(400).json({
        success: false,
        message: "This opportunity is not currently active for applications",
      });
    }

    if (
      opportunity.applicationDeadline &&
      new Date() > new Date(opportunity.applicationDeadline)
    ) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed",
      });
    }

    // Pending applications do not consume a slot. Capacity is reserved when approved.
    if (
      opportunity.maxVolunteers &&
      opportunity.approvedVolunteersCount >= opportunity.maxVolunteers
    ) {
      return res.status(400).json({
        success: false,
        message: "Opportunity has reached full capacity",
      });
    }

    const userAvailability = req.user?.availability || [];
    if (
      userAvailability.length > 0 &&
      !isOpportunityInsideAvailability(opportunity, userAvailability)
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot apply for an opportunity outside your specified availability times.",
      });
    }

    const existingApplication = await Application.findOne({
      volunteerId,
      opportunityId,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this opportunity",
      });
    }

    const application = await Application.create({
      volunteerId,
      opportunityId,
      status: "pending",
    });

    const populatedApplication = await populateApplication(
      Application.findById(application._id),
    );

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: populatedApplication,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this opportunity",
      });
    }

    console.log("Error in createApplication controller: ", err.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/** List applications belonging to the authenticated volunteer. */
export const getMyApplications = async (req, res) => {
  try {
    const volunteerId = req.user._id;
    const { status } = req.query;
    const query = { volunteerId };

    if (status !== undefined) {
      if (!isValidStatus(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${APPLICATION_STATUSES.join(", ")}`,
        });
      }
      query.status = toStatus(status);
    }

    const applications = await populateApplication(
      Application.find(query).sort({ createdAt: -1 }),
    );

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/** List applications received by the authenticated organisation. */
export const getMyOrganisationApplications = async (req, res) => {
  try {
    const organisationId = req.user._id;
    const { status, opportunityId } = req.query;

    if (status !== undefined && !isValidStatus(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${APPLICATION_STATUSES.join(", ")}`,
      });
    }

    const myOpportunities = await Opportunity.find({
      organisationId,
      deletedAt: null,
    }).select("_id");
    const myOpportunityIds = myOpportunities.map((opportunity) => opportunity._id);

    if (opportunityId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid opportunity ID",
        });
      }

      if (!myOpportunityIds.some((id) => isSameId(id, opportunityId))) {
        return res.status(404).json({
          success: false,
          message: "Opportunity not found",
        });
      }
    }

    const query = {
      opportunityId: opportunityId ? opportunityId : { $in: myOpportunityIds },
    };

    if (status !== undefined) {
      query.status = toStatus(status);
    }

    const applications = await populateApplication(
      Application.find(query).sort({ createdAt: -1 }),
    );

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (err) {
    console.log("Error in getMyOrganisationApplications controller: ", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/** Withdraw a pending or approved application owned by the volunteer. */
export const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { withdrawalReason } = req.body || {};
    const volunteerId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid application ID" });
    }

    if (
      withdrawalReason !== undefined &&
      (typeof withdrawalReason !== "string" || withdrawalReason.trim().length > 500)
    ) {
      return res.status(400).json({
        success: false,
        message: "Withdrawal reason must be a string with at most 500 characters",
      });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (!isSameId(application.volunteerId, volunteerId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to withdraw this application",
      });
    }

    if (!["pending", "approved"].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw an application that is already ${application.status}`,
      });
    }

    const update = {
      $set: {
        status: "withdrawn",
        withdrawalReason: withdrawalReason?.trim() || "",
      },
    };

    let updatedApplication;
    if (application.status === "approved") {
      const releasedOpportunity = await releaseApprovedSlot(application.opportunityId);
      if (!releasedOpportunity) {
        return res.status(409).json({
          success: false,
          message: "The approved volunteer count could not be reconciled. Please contact an administrator.",
        });
      }

      updatedApplication = await Application.findOneAndUpdate(
        { _id: id, volunteerId, status: "approved" },
        update,
        { new: true, runValidators: true },
      );

      if (!updatedApplication) {
        await Opportunity.updateOne(
          { _id: application.opportunityId },
          { $inc: { approvedVolunteersCount: 1 } },
        );
        return res.status(409).json({
          success: false,
          message: "Application changed before it could be withdrawn",
        });
      }
    } else {
      updatedApplication = await Application.findOneAndUpdate(
        { _id: id, volunteerId, status: "pending" },
        update,
        { new: true, runValidators: true },
      );

      if (!updatedApplication) {
        return res.status(409).json({
          success: false,
          message: "Application changed before it could be withdrawn",
        });
      }
    }

    const populatedApplication = await populateApplication(
      Application.findById(updatedApplication._id),
    );

    return res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
      data: populatedApplication,
    });
  } catch (err) {
    console.log("Error in withdrawApplication controller: ", err.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const applications = await populateApplication(Application.find());

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (err) {
    console.log("Error in getAllApplications controller: ", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid application ID" });
    }

    const application = await populateApplication(Application.findById(id));
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isApplicant =
      req.user.role === "volunteer" && isSameId(application.volunteerId?._id, req.user._id);
    const isOpportunityOwner =
      req.user.role === "organisation" &&
      isSameId(application.opportunityId?.organisationId?._id, req.user._id);

    if (!isAdmin && !isApplicant && !isOpportunityOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorised to view this application",
      });
    }

    return res.status(200).json({ success: true, data: application });
  } catch (err) {
    console.log("Error in getApplicationById controller: ", err.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, rejectionReason } = req.body || {};
    const reasonText = typeof reason === "string" ? reason : rejectionReason;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid application ID" });
    }

    if (
      reasonText !== undefined &&
      (typeof reasonText !== "string" || reasonText.length > 500)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason must be a string with at most 500 characters",
      });
    }

    const { application, error } = await getOrganisationOwnedApplication(
      id,
      req.user._id,
    );
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    const updatedApplication = await populateApplication(
      Application.findOneAndUpdate(
        { _id: id, status: "pending" },
        {
          $set: {
            status: "rejected",
            rejectionReason: reasonText?.trim() || "",
          },
        },
        { new: true, runValidators: true },
      ),
    );

    if (!updatedApplication) {
      return res.status(409).json({
        success: false,
        message: `Application is already ${application.status}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      data: updatedApplication,
    });
    sendStatusEmailSafely(updatedApplication, "rejected");
  } catch (err) {
    console.log("Error in rejectApplication controller: ", err.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid application ID" });
    }

    const { application, error } = await getOrganisationOwnedApplication(
      id,
      req.user._id,
    );
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    if (!["active", "closed"].includes(application.opportunityId?.status)) {
      return res.status(400).json({
        success: false,
        message: "Applications cannot be approved for a cancelled or completed opportunity",
      });
    }

    if (application.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: `Application is already ${application.status}`,
      });
    }

    // Reserve capacity first. The conditional update prevents two approvals from
    // exceeding maxVolunteers when requests arrive concurrently.
    const reservedOpportunity = await Opportunity.findOneAndUpdate(
      {
        _id: application.opportunityId._id,
        approvedVolunteersCount: { $lt: application.opportunityId.maxVolunteers },
        status: { $in: ["active", "closed"] },
      },
      { $inc: { approvedVolunteersCount: 1 } },
      { new: true },
    );

    if (!reservedOpportunity) {
      return res.status(409).json({
        success: false,
        message: "Opportunity has reached full capacity or is no longer available",
      });
    }

    const updatedApplication = await populateApplication(
      Application.findOneAndUpdate(
        { _id: id, status: "pending" },
        { $set: { status: "approved" } },
        { new: true, runValidators: true },
      ),
    );

    if (!updatedApplication) {
      await releaseApprovedSlot(application.opportunityId._id);
      return res.status(409).json({
        success: false,
        message: "Application changed before it could be approved",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application approved successfully",
      data: updatedApplication,
    });
    sendStatusEmailSafely(updatedApplication, "approved");
  } catch (err) {
    console.log("Error in approveApplication controller: ", err.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid application ID" });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.status === "approved") {
      const releasedOpportunity = await releaseApprovedSlot(application.opportunityId);
      if (!releasedOpportunity) {
        return res.status(409).json({
          success: false,
          message: "The approved volunteer count could not be reconciled. Please contact an administrator.",
        });
      }
    }

    const deletedApplication = await Application.findOneAndDelete({
      _id: id,
      status: application.status,
    });

    if (!deletedApplication) {
      if (application.status === "approved") {
        await Opportunity.updateOne(
          { _id: application.opportunityId },
          { $inc: { approvedVolunteersCount: 1 } },
        );
      }
      return res.status(409).json({
        success: false,
        message: "Application changed before it could be deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (err) {
    console.log("Error in deleteApplication controller: ", err.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
