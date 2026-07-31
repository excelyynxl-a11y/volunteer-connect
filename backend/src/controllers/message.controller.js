import mongoose from "mongoose";

import {
  emitConversationCreated,
  emitConversationDeleted,
  emitMessageCreated,
} from "../events/message.events.js";
import {
  getMessagePayloadError,
  getNextResponseDeadline,
  isResponseDeadlineExpired,
} from "../lib/messageLifecycle.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { Organisation } from "../models/user.model.js";
import { cleanupUploadedAttachment } from "../services/attachmentCleanup.service.js";
import {
  getMessageAttachmentDownloadUrl,
  uploadMessageAttachmentToCloudinary,
} from "../services/cloudinary.service.js";
import {
  deleteConversationPermanently,
  deleteExpiredConversations,
  isConversationParticipant,
} from "../services/conversation.service.js";
import {
  cancelConversationExpiry,
  scheduleConversationExpiry,
} from "../services/conversationExpiry.service.js";

const toClientAttachment = (attachment) =>
  attachment
    ? {
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        size: attachment.size,
      }
    : null;

const toClientMessage = (message) => ({
  _id: message._id,
  conversationId: message.conversationId,
  senderId: message.senderId,
  content: message.content,
  attachment: toClientAttachment(message.attachment),
  isRead: message.isRead,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
});

const getConversationById = async (conversationId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return { error: "Invalid conversation ID", status: 400 };
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return { error: "Conversation not found", status: 404 };
  }

  if (conversation.deletionStartedAt) {
    return { error: "Conversation has ended", status: 410 };
  }

  return { conversation };
};

const getAccessibleConversation = async (conversationId, user) => {
  const result = await getConversationById(conversationId);

  if (!result.conversation) {
    return result;
  }

  if (!isConversationParticipant(result.conversation, user)) {
    return {
      error: "You are not a participant in this conversation",
      status: 403,
    };
  }

  if (isResponseDeadlineExpired(result.conversation.responseDeadline)) {
    const deletion = await deleteConversationPermanently(
      result.conversation._id,
      "volunteer_reply_timeout",
      {
        expectedResponseDeadline: result.conversation.responseDeadline,
      },
    );

    if (deletion) {
      cancelConversationExpiry(result.conversation._id);
      emitConversationDeleted(deletion);
      return { error: "Conversation has ended", status: 410 };
    }

    return getConversationById(conversationId);
  }

  return result;
};

const sendError = (res, result) =>
  res.status(result.status).json({
    success: false,
    message: result.error,
  });

export const getMyConversations = async (req, res) => {
  try {
    const expiredDeletions = await deleteExpiredConversations();
    expiredDeletions.forEach((deletion) => {
      emitConversationDeleted(deletion);
    });

    const participantFilter =
      req.user.role === "volunteer"
        ? { volunteerId: req.user._id }
        : { organisationId: req.user._id };
    const conversations = await Conversation.find({
      ...participantFilter,
      deletionStartedAt: null,
    })
      .populate("volunteerId", "name role avatar")
      .populate("organisationId", "name role avatar")
      .sort({ lastMessageAt: -1, createdAt: -1 });

    const conversationSummaries = await Promise.all(
      conversations.map(async (conversation) => {
        const [lastMessage, unreadCount] = await Promise.all([
          Message.findOne({ conversationId: conversation._id }).sort({
            createdAt: -1,
          }),
          Message.countDocuments({
            conversationId: conversation._id,
            senderId: { $ne: req.user._id },
            isRead: false,
          }),
        ]);

        const participant =
          req.user.role === "volunteer"
            ? conversation.organisationId
            : conversation.volunteerId;

        return {
          _id: conversation._id,
          participant,
          lastMessage: lastMessage ? toClientMessage(lastMessage) : null,
          unreadCount,
          lastMessageAt: conversation.lastMessageAt,
          responseDeadline: conversation.responseDeadline,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: conversationSummaries,
    });
  } catch (error) {
    console.log("Error in getMyConversations controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const initiateConversation = async (req, res) => {
  let createdConversation = null;
  let uploadedAttachment = null;

  try {
    if (req.user.role !== "volunteer") {
      return res.status(403).json({
        success: false,
        message: "Only volunteers can start conversations",
      });
    }

    const { organisationId, content = "" } = req.body ?? {};
    const payloadError = getMessagePayloadError(content, Boolean(req.file));

    if (!organisationId || !mongoose.Types.ObjectId.isValid(organisationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organisation ID",
      });
    }

    if (payloadError) {
      return res.status(400).json({
        success: false,
        message: payloadError,
      });
    }

    const organisation = await Organisation.findOne({
      _id: organisationId,
      approvalStatus: "approved",
    }).select("_id");

    if (!organisation) {
      return res.status(404).json({
        success: false,
        message: "Approved organisation not found",
      });
    }

    const existingConversation = await Conversation.findOne({
      volunteerId: req.user._id,
      organisationId: organisation._id,
      deletionStartedAt: null,
    });

    if (existingConversation) {
      return res.status(409).json({
        success: false,
        message: "An active conversation already exists",
        data: { conversationId: existingConversation._id },
      });
    }

    try {
      createdConversation = await Conversation.create({
        volunteerId: req.user._id,
        organisationId: organisation._id,
      });
    } catch (error) {
      if (error?.code === 11000) {
        const concurrentConversation = await Conversation.findOne({
          volunteerId: req.user._id,
          organisationId: organisation._id,
        }).select("_id");

        return res.status(409).json({
          success: false,
          message: "An active conversation already exists",
          data: { conversationId: concurrentConversation?._id },
        });
      }

      throw error;
    }

    if (req.file) {
      uploadedAttachment =
        await uploadMessageAttachmentToCloudinary(req.file);
    }

    const message = await Message.create({
      conversationId: createdConversation._id,
      senderId: req.user._id,
      content: content.trim(),
      attachment: uploadedAttachment,
    });

    createdConversation.lastMessageAt = message.createdAt;
    await createdConversation.save();
    const clientMessage = toClientMessage(message);

    emitConversationCreated({
      conversation: createdConversation,
      message: clientMessage,
      responseDeadline: null,
    });

    return res.status(201).json({
      success: true,
      message: "Conversation started successfully",
      data: {
        conversation: createdConversation,
        message: clientMessage,
      },
    });
  } catch (error) {
    const rollbackTasks = [];

    if (createdConversation?._id) {
      rollbackTasks.push(
        deleteConversationPermanently(
          createdConversation._id,
          "initialisation_failed",
        ),
      );
    }

    if (uploadedAttachment) {
      rollbackTasks.push(cleanupUploadedAttachment(uploadedAttachment));
    }

    await Promise.allSettled(rollbackTasks);

    console.log("Error in initiateConversation controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const result = await getAccessibleConversation(
      req.params.conversationId,
      req.user,
    );

    if (!result.conversation) {
      return sendError(res, result);
    }

    const messages = await Message.find({
      conversationId: result.conversation._id,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: {
        conversation: {
          _id: result.conversation._id,
          responseDeadline: result.conversation.responseDeadline,
        },
        messages: messages.map(toClientMessage),
      },
    });
  } catch (error) {
    console.log(
      "Error in getConversationMessages controller: ",
      error.message,
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const sendMessage = async (req, res) => {
  let createdMessage = null;
  let uploadedAttachment = null;

  try {
    const { content = "" } = req.body ?? {};
    const payloadError = getMessagePayloadError(content, Boolean(req.file));

    if (payloadError) {
      return res.status(400).json({
        success: false,
        message: payloadError,
      });
    }

    const result = await getAccessibleConversation(
      req.params.conversationId,
      req.user,
    );

    if (!result.conversation) {
      return sendError(res, result);
    }

    if (req.file) {
      uploadedAttachment =
        await uploadMessageAttachmentToCloudinary(req.file);
    }

    createdMessage = await Message.create({
      conversationId: result.conversation._id,
      senderId: req.user._id,
      content: content.trim(),
      attachment: uploadedAttachment,
    });

    result.conversation.lastMessageAt = createdMessage.createdAt;
    result.conversation.responseDeadline = getNextResponseDeadline(
      req.user.role,
      createdMessage.createdAt,
    );
    await result.conversation.save();
    const clientMessage = toClientMessage(createdMessage);

    if (result.conversation.responseDeadline) {
      scheduleConversationExpiry(
        result.conversation._id,
        result.conversation.responseDeadline,
      );
    } else {
      cancelConversationExpiry(result.conversation._id);
    }

    emitMessageCreated({
      conversation: result.conversation,
      message: clientMessage,
      responseDeadline: result.conversation.responseDeadline,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        message: clientMessage,
        responseDeadline: result.conversation.responseDeadline,
      },
    });
  } catch (error) {
    const rollbackTasks = [];

    if (createdMessage?._id) {
      rollbackTasks.push(Message.deleteOne({ _id: createdMessage._id }));
    }

    if (uploadedAttachment) {
      rollbackTasks.push(cleanupUploadedAttachment(uploadedAttachment));
    }

    await Promise.allSettled(rollbackTasks);

    console.log("Error in sendMessage controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const downloadMessageAttachment = async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const result = await getAccessibleConversation(conversationId, req.user);

    if (!result.conversation) {
      return sendError(res, result);
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    const message = await Message.findOne({
      _id: messageId,
      conversationId: result.conversation._id,
    });

    if (!message?.attachment) {
      return res.status(404).json({
        success: false,
        message: "Message attachment not found",
      });
    }

    const downloadUrl = getMessageAttachmentDownloadUrl(message.attachment);
    res.set("Cache-Control", "no-store");
    return res.redirect(302, downloadUrl);
  } catch (error) {
    console.log(
      "Error in downloadMessageAttachment controller: ",
      error.message,
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const markConversationAsRead = async (req, res) => {
  try {
    const result = await getAccessibleConversation(
      req.params.conversationId,
      req.user,
    );

    if (!result.conversation) {
      return sendError(res, result);
    }

    const updateResult = await Message.updateMany(
      {
        conversationId: result.conversation._id,
        senderId: { $ne: req.user._id },
        isRead: false,
      },
      {
        $set: { isRead: true },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Conversation marked as read",
      data: {
        updatedCount: updateResult.modifiedCount,
      },
    });
  } catch (error) {
    console.log("Error in markConversationAsRead controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const endConversation = async (req, res) => {
  try {
    if (req.user.role !== "organisation") {
      return res.status(403).json({
        success: false,
        message: "Only organisations can end conversations",
      });
    }

    const result = await getConversationById(req.params.conversationId);

    if (!result.conversation) {
      return sendError(res, result);
    }

    if (!isConversationParticipant(result.conversation, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    const deletion = await deleteConversationPermanently(
      result.conversation._id,
      "ended_by_organisation",
    );
    cancelConversationExpiry(result.conversation._id);
    emitConversationDeleted(deletion);

    return res.status(200).json({
      success: true,
      message: "Conversation ended and deleted successfully",
    });
  } catch (error) {
    console.log("Error in endConversation controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
