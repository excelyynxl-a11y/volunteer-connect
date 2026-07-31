import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/events/message.events.js", () => ({
  emitConversationDeleted: vi.fn(),
}));

vi.mock("../../src/models/conversation.model.js", () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock("../../src/services/attachmentCleanup.service.js", () => ({
  processAttachmentCleanupJobs: vi.fn(),
}));

vi.mock("../../src/services/conversationExpiry.service.js", () => ({
  clearAllConversationExpiryTimers: vi.fn(),
  scheduleConversationExpiry: vi.fn(),
}));

vi.mock("../../src/services/conversation.service.js", () => ({
  deleteExpiredConversations: vi.fn(),
  retryPendingConversationDeletions: vi.fn(),
}));

import { emitConversationDeleted } from "../../src/events/message.events.js";
import Conversation from "../../src/models/conversation.model.js";
import { processAttachmentCleanupJobs } from "../../src/services/attachmentCleanup.service.js";
import { scheduleConversationExpiry } from "../../src/services/conversationExpiry.service.js";
import {
  recoverConversationExpirySchedules,
  runMessagingMaintenance,
} from "../../src/services/messagingMaintenance.service.js";
import {
  deleteExpiredConversations,
  retryPendingConversationDeletions,
} from "../../src/services/conversation.service.js";

describe("messaging maintenance recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    deleteExpiredConversations.mockResolvedValue([]);
    retryPendingConversationDeletions.mockResolvedValue([]);
    processAttachmentCleanupJobs.mockResolvedValue([]);
  });

  it("emits deletions recovered from deadlines and interrupted cleanup", async () => {
    const timeoutDeletion = {
      conversationId: "conversation-1",
      deletionReason: "volunteer_reply_timeout",
    };
    const retriedDeletion = {
      conversationId: "conversation-2",
      deletionReason: "ended_by_organisation",
    };
    deleteExpiredConversations.mockResolvedValue([timeoutDeletion]);
    retryPendingConversationDeletions.mockResolvedValue([retriedDeletion]);

    const result = await runMessagingMaintenance(
      new Date("2026-07-31T01:00:00.000Z"),
    );

    expect(emitConversationDeleted).toHaveBeenCalledWith(timeoutDeletion);
    expect(emitConversationDeleted).toHaveBeenCalledWith(retriedDeletion);
    expect(result).toEqual({
      skipped: false,
      deletedCount: 2,
    });
  });

  it("rebuilds exact timers for future MongoDB deadlines after restart", async () => {
    const now = new Date("2026-07-31T01:00:00.000Z");
    const conversation = {
      _id: "conversation-3",
      responseDeadline: new Date("2026-07-31T04:00:00.000Z"),
    };
    Conversation.find.mockReturnValue({
      select: vi.fn().mockResolvedValue([conversation]),
    });

    const count = await recoverConversationExpirySchedules(now);

    expect(scheduleConversationExpiry).toHaveBeenCalledWith(
      conversation._id,
      conversation.responseDeadline,
    );
    expect(count).toBe(1);
  });
});
