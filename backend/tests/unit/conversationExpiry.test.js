import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/events/message.events.js", () => ({
  emitConversationDeleted: vi.fn(),
}));

vi.mock("../../src/models/conversation.model.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock("../../src/services/conversation.service.js", () => ({
  deleteConversationPermanently: vi.fn(),
}));

import { emitConversationDeleted } from "../../src/events/message.events.js";
import Conversation from "../../src/models/conversation.model.js";
import {
  cancelConversationExpiry,
  clearAllConversationExpiryTimers,
  expireConversationAtDeadline,
  getScheduledConversationExpiryCount,
  scheduleConversationExpiry,
} from "../../src/services/conversationExpiry.service.js";
import { deleteConversationPermanently } from "../../src/services/conversation.service.js";

describe("conversation expiry scheduling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T01:00:00.000Z"));
  });

  afterEach(() => {
    clearAllConversationExpiryTimers();
    vi.useRealTimers();
  });

  it("keeps only the latest scheduled deadline for a conversation", () => {
    scheduleConversationExpiry(
      "conversation-1",
      new Date("2026-07-31T02:00:00.000Z"),
    );
    scheduleConversationExpiry(
      "conversation-1",
      new Date("2026-07-31T03:00:00.000Z"),
    );

    expect(getScheduledConversationExpiryCount()).toBe(1);

    cancelConversationExpiry("conversation-1");
    expect(getScheduledConversationExpiryCount()).toBe(0);
  });

  it("hard-deletes only the conversation with the expected due deadline", async () => {
    const deadline = new Date("2026-07-31T01:00:00.000Z");
    const conversation = {
      _id: "conversation-2",
      deletionStartedAt: null,
      responseDeadline: deadline,
    };
    Conversation.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue(conversation),
    });
    const deletion = {
      conversationId: conversation._id,
      deletionReason: "volunteer_reply_timeout",
      organisationId: "organisation-1",
      volunteerId: "volunteer-1",
    };
    deleteConversationPermanently.mockResolvedValue(deletion);

    const result = await expireConversationAtDeadline(
      conversation._id,
      deadline,
    );

    expect(deleteConversationPermanently).toHaveBeenCalledWith(
      conversation._id,
      "volunteer_reply_timeout",
      { expectedResponseDeadline: deadline },
    );
    expect(emitConversationDeleted).toHaveBeenCalledWith(deletion);
    expect(result).toBe(deletion);
  });
});
