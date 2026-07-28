import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { User } from "../models/user.model.js";

const sendNotImplemented = (res, feature) =>
  res.status(501).json({
    success: false,
    message: `${feature} is not implemented yet`,
  });

/**
 * TODO(message): List conversations for the authenticated user.
 * Query: { limit?: number, cursor?: string }
 * Success: { success, data: conversation[], meta?: { nextCursor } }
 */
export const getMyConversations = (req, res) => {
  return sendNotImplemented(res, "Conversation listing");
};

export const createOrGetConversation = async (req, res) => {
  try {
    const { participantId } = req.body ?? {};

    if (!participantId || !mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid participant ID",
      });
    }

    if (req.user._id.equals(participantId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot start a conversation with yourself",
      });
    }

    const participant = await User.findById(participantId).select("_id");

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    const participantIds = [req.user._id, participant._id];
    const existingConversation = await Conversation.findOne({
      participants: {
        $all: participantIds,
        $size: 2,
      },
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        data: existingConversation,
      });
    }

    const conversation = await Conversation.create({
      participants: participantIds,
    });

    return res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    console.log("Error in createOrGetConversation controller: ", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some((participantId) =>
      participantId.equals(req.user._id),
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    console.log(
      "Error in getConversationMessages controller: ",
      err.message,
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body ?? {};

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some((participantId) =>
      participantId.equals(req.user._id),
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      content: content.trim(),
    });

    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (err) {
    console.log("Error in sendMessage controller: ", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * TODO(message): Mark unread messages from the other participant as read.
 * Params: { conversationId: string }
 * Body: none
 * Success: { success, message, data: { updatedCount: number } }
 */
export const markConversationAsRead = (req, res) => {
  return sendNotImplemented(res, "Conversation read status update");
};
