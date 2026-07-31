import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    responseDeadline: {
      type: Date,
      default: null,
    },
    deletionStartedAt: {
      type: Date,
      default: null,
    },
    deletionReason: {
      type: String,
      enum: ["volunteer_reply_timeout", "ended_by_organisation"],
      default: null,
    },
  },
  { timestamps: true },
);

conversationSchema.index(
  { volunteerId: 1, organisationId: 1 },
  { unique: true },
);
conversationSchema.index({ responseDeadline: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
