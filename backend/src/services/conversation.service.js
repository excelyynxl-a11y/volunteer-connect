import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

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
) => {
  let conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return null;
  }

  if (!conversation.deletionStartedAt) {
    conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        deletionStartedAt: null,
      },
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

  await Message.deleteMany({ conversationId });
  await Conversation.deleteOne({ _id: conversationId });

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
  }).select("_id");

  const deletionResults = await Promise.allSettled(
    expiredConversations.map(({ _id }) =>
      deleteConversationPermanently(_id, "volunteer_reply_timeout"),
    ),
  );

  return deletionResults
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => result.value);
};
