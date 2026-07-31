import mongoose from "mongoose";
import { describe, expect, it } from "vitest";

import {
  getMessageContentError,
  getNextResponseDeadline,
  isResponseDeadlineExpired,
  MESSAGE_RESPONSE_WINDOW_MS,
} from "../../src/lib/messageLifecycle.js";
import Conversation from "../../src/models/conversation.model.js";
import Message from "../../src/models/message.model.js";

describe("messaging lifecycle rules", () => {
  it("requires a non-empty message of at most 2,000 characters", () => {
    expect(getMessageContentError("")).toBe("Message content is required");
    expect(getMessageContentError("   ")).toBe("Message content is required");
    expect(getMessageContentError("a".repeat(2000))).toBe("");
    expect(getMessageContentError("a".repeat(2001))).toBe(
      "Message content must be 2000 characters or fewer",
    );
  });

  it("starts a three-hour deadline only after an organisation message", () => {
    const sentAt = new Date("2026-07-31T01:00:00.000Z");

    expect(getNextResponseDeadline("volunteer", sentAt)).toBeNull();
    expect(
      getNextResponseDeadline("organisation", sentAt).getTime(),
    ).toBe(sentAt.getTime() + MESSAGE_RESPONSE_WINDOW_MS);
  });

  it("treats the deadline instant as expired", () => {
    const deadline = new Date("2026-07-31T04:00:00.000Z");

    expect(
      isResponseDeadlineExpired(
        deadline,
        new Date("2026-07-31T03:59:59.999Z"),
      ),
    ).toBe(false);
    expect(isResponseDeadlineExpired(deadline, deadline)).toBe(true);
  });
});

describe("messaging model contracts", () => {
  it("requires explicit volunteer and organisation participants", () => {
    const conversation = new Conversation();
    const validationError = conversation.validateSync();

    expect(validationError.errors.volunteerId).toBeDefined();
    expect(validationError.errors.organisationId).toBeDefined();
  });

  it("accepts the expected one-to-one conversation fields", () => {
    const conversation = new Conversation({
      volunteerId: new mongoose.Types.ObjectId(),
      organisationId: new mongoose.Types.ObjectId(),
      responseDeadline: new Date("2026-07-31T04:00:00.000Z"),
    });

    expect(conversation.validateSync()).toBeUndefined();
  });

  it("enforces the text message length at model level", () => {
    const message = new Message({
      conversationId: new mongoose.Types.ObjectId(),
      senderId: new mongoose.Types.ObjectId(),
      content: "a".repeat(2001),
    });
    const validationError = message.validateSync();

    expect(validationError.errors.content).toBeDefined();
  });
});
