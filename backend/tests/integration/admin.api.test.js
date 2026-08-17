import { describe, it } from "vitest";

describe("admin and user-management API", () => {
  it.todo("rejects all user-management routes for a non-admin");
  it.todo("lists users by type without password or internal version fields");
  it.todo("returns one safe user and a not-found response");
  it.todo("approves and rejects Volunteer and Organisation accounts");
  it.todo("does not allow the review endpoint to change an Admin account");
  it.todo("updates the authenticated Admin profile and avatar");
  it.todo("deletes an existing user and handles a repeated delete safely");
});
