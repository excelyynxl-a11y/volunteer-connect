import { describe, it } from "vitest";

describe("admin user-management controller", () => {
  it.todo("lists users without password or internal version fields");
  it.todo("lists volunteers, organisations, and admins from the correct model");
  it.todo("returns one safe user by ID");
  it.todo("returns not found when the requested user does not exist");
  it.todo("deletes an existing user and reports success");
  it.todo("does not report success when the user to delete is missing");
  it.todo("returns a safe server error when a user query fails");
});
