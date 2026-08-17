import { describe, it } from "vitest";

describe("opportunity controller", () => {
  describe("create", () => {
    it.todo("validates required strings and their maximum lengths");
    it.todo("requires a positive integer maximum volunteer count");
    it.todo("validates date formats and chronological order");
    it.todo("rejects a start date before today");
    it.todo("validates categories, requirements, and HTTP image URLs");
    it.todo("derives the owning organisation from the authenticated user");
    it.todo("maps model validation and database failures to safe responses");
  });

  describe("read and update", () => {
    it.todo("returns list, detail, missing, invalid-ID, and database-error outcomes");
    it.todo("requires at least one valid update field");
    it.todo("allows only the owner or an admin to update an opportunity");
    it.todo("prevents capacity from dropping below the approved count");
    it.todo("validates the combined existing and updated date values");
    it.todo("saves only supplied fields and preserves other values");
  });

  describe("delete and own list", () => {
    it.todo("handles invalid, missing, successful, and failed deletion");
    it.todo("lists only opportunities owned by the authenticated organisation");
  });
});
