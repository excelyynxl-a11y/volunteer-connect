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

/**
 * TODO(message): Return an existing one-to-one conversation or create one.
 * Body: { participantId: string }
 * Success: { success, data: conversation }
 * Rules: confirm which volunteer/organisation pairs are allowed to message.
 */
export const createOrGetConversation = (req, res) => {
  return sendNotImplemented(res, "Conversation creation");
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
