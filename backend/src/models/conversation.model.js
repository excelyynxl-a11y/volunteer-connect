import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      required: true,
      validate: [
        {
          validator: (participants) => participants.length === 2,
          message: "A conversation must have exactly two participants",
        },
        {
          validator: (participants) =>
            new Set(participants.map(String)).size === participants.length,
          message: "Conversation participants must be different users",
        },
      ],
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
