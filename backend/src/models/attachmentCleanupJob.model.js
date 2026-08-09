import mongoose from "mongoose";

const attachmentCleanupJobSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    resourceType: {
      type: String,
      enum: ["image", "raw"],
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    nextAttemptAt: {
      type: Date,
      default: Date.now,
    },
    lastError: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

attachmentCleanupJobSchema.index({ nextAttemptAt: 1 });

const AttachmentCleanupJob = mongoose.model(
  "AttachmentCleanupJob",
  attachmentCleanupJobSchema,
);

export default AttachmentCleanupJob;
