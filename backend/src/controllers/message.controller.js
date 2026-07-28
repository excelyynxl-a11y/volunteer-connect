import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
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

/**
 * TODO(message): Load message history for a conversation.
 * Params: { conversationId: string }
 * Query: { limit?: number, cursor?: string }
 * Success: { success, data: message[], meta?: { nextCursor } }
 * Rules: the authenticated user must be a conversation participant.
 */
export const getConversationMessages = (req, res) => {
  return sendNotImplemented(res, "Conversation message history");
};

/**
 * TODO(message): Persist a message in a conversation.
 * Params: { conversationId: string }
 * Body: { content: string }
 * Success: { success, message, data: message }
 * Rules: derive senderId from req.user and validate conversation membership.
 */
export const sendMessage = (req, res) => {
  return sendNotImplemented(res, "Message sending");
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
