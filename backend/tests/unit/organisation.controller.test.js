import { describe, it } from "vitest";

describe("organisation controller", () => {
  describe("public profile", () => {
    it.todo("rejects an invalid organisation ID");
    it.todo("returns not found for a missing or unapproved organisation");
    it.todo("returns only name, avatar, and biodata for an approved organisation");
  });

  describe("own profile update", () => {
    it.todo("uses the authenticated organisation identity");
    it.todo("requires at least one field or avatar");
    it.todo("validates and trims name and biodata");
    it.todo("uploads an avatar through the Cloudinary service boundary");
    it.todo("returns safe saved profile fields");
    it.todo("returns a safe error when avatar upload or persistence fails");
  });
});
