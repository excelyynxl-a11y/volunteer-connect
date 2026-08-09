import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    publicId: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["image", "raw"],
      required: true,
    },
    mimeType: {
      type: String,
      enum: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
      required: true,
    },
    size: {
      type: Number,
      min: 1,
      max: 5 * 1024 * 1024,
      required: true,
    },
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
      validate: {
        validator(content) {
          return Boolean(content?.trim() || this.attachment);
        },
        message: "Message text or an attachment is required",
      },
    },
    attachment: {
      type: attachmentSchema,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ conversationId: 1, senderId: 1, isRead: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
