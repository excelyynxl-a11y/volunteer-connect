import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reportType: {
      type: String,
      enum: ["UserViolation", "OpportunityViolation"],
      required: true,
    },

    // If it's a UserViolation, this field is populated
    userViolationType: {
      type: String,
      enum: [
        "Last Minute Ghosting",
        "Not Punctual",
        "Poor Work Ethics",
        "Rudeness and Disrespectful",
        "Inappropriate Dress Code",
        "Property Damage",
        "Harassment and Discrimination",
        "Others",
      ],
      required: function () {
        return this.reportType === "UserViolation";
      },
    },

    // If it's an OpportunityViolation, this field is populated
    opportunityViolationType: {
      type: String,
      enum: [
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
      ],
      required: function () {
        return this.reportType === "OpportunityViolation";
      },
    },

    // Report Title
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    // If it's a UserViolation, this field is populated
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.reportType === "UserViolation";
      },
    },

    // If it's an OpportunityViolation, this field is populated
    reportedOpportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: function () {
        return this.reportType === "OpportunityViolation";
      },
    },

    details: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Investigating", "Resolved", "Dismissed"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
