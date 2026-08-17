import { describe, it } from "vitest";

describe("messaging API", () => {
  it.todo("allows only an approved Volunteer to start a conversation with an approved Organisation");
  it.todo("creates a conversation only with the first valid text or attachment message");
  it.todo("prevents a second active conversation for the same pair");
  it.todo("allows only participants to list, read, send, mark read, and download");
  it.todo("accepts valid text and multipart attachments while rejecting invalid payloads");
  it.todo("starts or resets the deadline after an Organisation message and clears it after a Volunteer reply");
  it.todo("allows only the Organisation participant to end the conversation");
  it.todo("persists before emitting lifecycle Socket events");
  it.todo("recovers expired deletion and attachment cleanup work after restart");
});
