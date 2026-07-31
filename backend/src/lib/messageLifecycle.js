export const MESSAGE_RESPONSE_WINDOW_MS = 3 * 60 * 60 * 1000;
export const MESSAGE_CONTENT_MAX_LENGTH = 2000;

export const getMessagePayloadError = (content, hasAttachment = false) => {
  const normalizedContent = typeof content === "string" ? content.trim() : "";

  if (!normalizedContent && !hasAttachment) {
    return "Message text or an attachment is required";
  }

  if (normalizedContent.length > MESSAGE_CONTENT_MAX_LENGTH) {
    return `Message content must be ${MESSAGE_CONTENT_MAX_LENGTH} characters or fewer`;
  }

  return "";
};

export const getMessageContentError = (content) =>
  getMessagePayloadError(content, false);

export const getNextResponseDeadline = (senderRole, sentAt = new Date()) => {
  if (senderRole !== "organisation") {
    return null;
  }

  return new Date(sentAt.getTime() + MESSAGE_RESPONSE_WINDOW_MS);
};

export const isResponseDeadlineExpired = (
  responseDeadline,
  now = new Date(),
) => Boolean(responseDeadline && responseDeadline.getTime() <= now.getTime());
