import { describe, it } from "vitest";

describe("admin controller", () => {
  describe("account review", () => {
    it.todo("rejects an invalid or missing user ID");
    it.todo("rejects attempts to review an admin account");
    it.todo("approves a pending volunteer or organisation and returns safe fields");
    it.todo("rejects a volunteer or organisation and returns safe fields");
    it.todo("rejects an already completed approval or rejection");
    it.todo("returns a safe server error when account review persistence fails");
  });

  describe("admin profile", () => {
    it.todo("requires at least one profile field");
    it.todo("validates and trims the admin name");
    it.todo("uploads an avatar through the Cloudinary service boundary");
    it.todo("returns a safe error when avatar upload or persistence fails");
  });
});
