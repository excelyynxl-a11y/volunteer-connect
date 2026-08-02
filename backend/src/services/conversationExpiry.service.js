import { emitConversationDeleted } from "../events/message.events.js";
import Conversation from "../models/conversation.model.js";
import { deleteConversationPermanently } from "./conversation.service.js";

const expiryTimers = new Map();

const getConversationKey = (conversationId) => String(conversationId);

export const cancelConversationExpiry = (conversationId) => {
  const key = getConversationKey(conversationId);
  const timer = expiryTimers.get(key);

  if (timer) {
    clearTimeout(timer);
    expiryTimers.delete(key);
  }
};

export const expireConversationAtDeadline = async (
  conversationId,
  expectedResponseDeadline,
) => {
  const conversation = await Conversation.findById(conversationId).select(
    "_id deletionStartedAt responseDeadline",
  );

  if (
    !conversation ||
    conversation.deletionStartedAt ||
    !conversation.responseDeadline
  ) {
    cancelConversationExpiry(conversationId);
    return null;
  }

  if (
    expectedResponseDeadline &&
    conversation.responseDeadline.getTime() !==
      expectedResponseDeadline.getTime()
  ) {
    scheduleConversationExpiry(
      conversation._id,
      conversation.responseDeadline,
    );
    return null;
  }

  const now = new Date();

  if (conversation.responseDeadline.getTime() > now.getTime()) {
    scheduleConversationExpiry(
      conversation._id,
      conversation.responseDeadline,
    );
    return null;
  }

  const deletion = await deleteConversationPermanently(
    conversation._id,
    "volunteer_reply_timeout",
    {
      expectedResponseDeadline: conversation.responseDeadline,
    },
  );

  cancelConversationExpiry(conversation._id);
  emitConversationDeleted(deletion);
  return deletion;
};

export const scheduleConversationExpiry = (
  conversationId,
  responseDeadline,
) => {
  cancelConversationExpiry(conversationId);

  if (!responseDeadline) {
    return;
  }

  const key = getConversationKey(conversationId);
  const deadline = new Date(responseDeadline);
  const delay = Math.max(deadline.getTime() - Date.now(), 0);
  const timer = setTimeout(() => {
    expiryTimers.delete(key);
    void expireConversationAtDeadline(conversationId, deadline).catch(
      (error) => {
        console.log(
          "Error expiring messaging conversation: ",
          error.message,
        );
      },
    );
  }, delay);

  timer.unref?.();
  expiryTimers.set(key, timer);
};

export const clearAllConversationExpiryTimers = () => {
  expiryTimers.forEach((timer) => clearTimeout(timer));
  expiryTimers.clear();
};

export const getScheduledConversationExpiryCount = () => expiryTimers.size;
