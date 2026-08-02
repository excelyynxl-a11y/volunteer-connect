import { emitToUsers } from "../lib/socket.js";
import { getConversationParticipantIds } from "../services/conversation.service.js";

export const MESSAGE_SOCKET_EVENTS = Object.freeze({
  conversationCreated: "conversation:created",
  deadlineChanged: "conversation:deadline-changed",
  conversationDeleted: "conversation:deleted",
  messageCreated: "message:created",
});

const getParticipantIds = (conversation) => {
  const { volunteerId, organisationId } =
    getConversationParticipantIds(conversation);
  return [volunteerId, organisationId];
};

export const emitConversationCreated = ({
  conversation,
  message,
  responseDeadline,
}) =>
  emitToUsers(
    getParticipantIds(conversation),
    MESSAGE_SOCKET_EVENTS.conversationCreated,
    {
      conversationId: String(conversation._id),
      message,
      responseDeadline,
    },
  );

export const emitMessageCreated = ({
  conversation,
  message,
  responseDeadline,
}) => {
  const userIds = getParticipantIds(conversation);
  const payload = {
    conversationId: String(conversation._id),
    message,
    responseDeadline,
  };

  emitToUsers(userIds, MESSAGE_SOCKET_EVENTS.messageCreated, payload);
  emitToUsers(userIds, MESSAGE_SOCKET_EVENTS.deadlineChanged, {
    conversationId: String(conversation._id),
    responseDeadline,
  });
};

export const emitConversationDeleted = (deletion) => {
  if (!deletion) {
    return false;
  }

  return emitToUsers(
    [deletion.volunteerId, deletion.organisationId],
    MESSAGE_SOCKET_EVENTS.conversationDeleted,
    {
      conversationId: deletion.conversationId,
      reason: deletion.deletionReason,
    },
  );
};
