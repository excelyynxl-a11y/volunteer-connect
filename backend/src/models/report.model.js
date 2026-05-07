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
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // If it's an OpportunityViolation, this field is populated
    reportedOpportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
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
