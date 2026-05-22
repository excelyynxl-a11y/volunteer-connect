import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },

    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "withdrawn"],
      default: "pending",
      index: true,
    },

    withdrawalReason: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true },
);

applicationSchema.index({ volunteerId: 1, opportunityId: 1 }, { unique: true });
applicationSchema.index({ volunteerId: 1, status: 1 });
applicationSchema.index({ opportunityId: 1, status: 1 });

const Application = mongoose.model("Application", applicationSchema);
export default Application;
