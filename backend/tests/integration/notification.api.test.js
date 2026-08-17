import { describe, it } from "vitest";

describe("notification API (future)", () => {
  it.todo("lists only notifications owned by the authenticated user");
  it.todo("returns the confirmed unread count");
  it.todo("allows only the owner to mark one notification as read");
  it.todo("marks all notifications for the authenticated user as read");
  it.todo("keeps one notification and one email delivery for an idempotent event");
  it.todo("records provider failure without exposing provider credentials or private data");
});
