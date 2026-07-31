import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import {
  processAttachmentCleanupJobs,
  queueAttachmentCleanup,
} from "./attachmentCleanup.service.js";

export const getConversationParticipantIds = (conversation) => ({
  volunteerId: conversation.volunteerId?._id ?? conversation.volunteerId,
  organisationId:
    conversation.organisationId?._id ?? conversation.organisationId,
});

export const isConversationParticipant = (conversation, user) => {
  const { volunteerId, organisationId } =
    getConversationParticipantIds(conversation);

  if (user.role === "volunteer") {
    return Boolean(volunteerId?.equals(user._id));
  }

  if (user.role === "organisation") {
    return Boolean(organisationId?.equals(user._id));
  }

  return false;
};

export const deleteConversationPermanently = async (
  conversationId,
  deletionReason,
  { expectedResponseDeadline } = {},
) => {
  let conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return null;
  }

  if (!conversation.deletionStartedAt) {
    const claimFilter = {
      _id: conversationId,
      deletionStartedAt: null,
    };

    if (expectedResponseDeadline) {
      claimFilter.responseDeadline = expectedResponseDeadline;
    }

    conversation = await Conversation.findOneAndUpdate(
      claimFilter,
      {
        $set: {
          deletionStartedAt: new Date(),
          deletionReason,
        },
      },
      { new: true },
    );
  }

  if (!conversation) {
    return null;
  }

  const participantIds = getConversationParticipantIds(conversation);
  const messagesWithAttachments = await Message.find({
    conversationId,
    "attachment.publicId": { $exists: true },
  }).select("attachment");
  const attachments = messagesWithAttachments
    .map((message) => message.attachment)
    .filter(Boolean);

  await queueAttachmentCleanup(attachments);
  await Message.deleteMany({ conversationId });
  await Conversation.deleteOne({ _id: conversationId });

  void processAttachmentCleanupJobs().catch((error) => {
    console.log("Error processing attachment cleanup jobs: ", error.message);
  });

  return {
    conversationId: String(conversationId),
    deletionReason: conversation.deletionReason ?? deletionReason,
    ...participantIds,
  };
};

export const deleteExpiredConversations = async (now = new Date()) => {
  const expiredConversations = await Conversation.find({
    deletionStartedAt: null,
    responseDeadline: { $ne: null, $lte: now },
  }).select("_id responseDeadline");

  const deletionResults = await Promise.allSettled(
    expiredConversations.map(({ _id, responseDeadline }) =>
      deleteConversationPermanently(_id, "volunteer_reply_timeout", {
        expectedResponseDeadline: responseDeadline,
      }),
    ),
  );

  return deletionResults
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => result.value);
};

export const retryPendingConversationDeletions = async () => {
  const pendingConversations = await Conversation.find({
    deletionStartedAt: { $ne: null },
  }).select("_id deletionReason");

  const deletionResults = await Promise.allSettled(
    pendingConversations.map(({ _id, deletionReason }) =>
      deleteConversationPermanently(_id, deletionReason),
    ),
  );

  return deletionResults
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => result.value);
};
