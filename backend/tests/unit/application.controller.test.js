import { describe, it } from "vitest";

describe("application controller", () => {
  describe("create", () => {
    it.todo("derives the volunteer from authentication and validates the opportunity ID");
    it.todo("rejects missing, non-active, deadline-passed, and full opportunities");
    it.todo("rejects an opportunity outside the volunteer availability");
    it.todo("rejects an existing or concurrently duplicated application");
    it.todo("creates a pending application and returns populated safe data");
  });

  describe("authorised reads", () => {
    it.todo("lists only the authenticated volunteer applications with a valid status filter");
    it.todo("lists only applications for opportunities owned by the authenticated organisation");
    it.todo("rejects invalid status and opportunity filters");
    it.todo("returns detail only to the applicant, owning organisation, or admin");
  });

  describe("state changes", () => {
    it.todo("allows only the owning organisation to approve or reject a pending application");
    it.todo("prevents repeated or forbidden approval and rejection transitions");
    it.todo("reserves the final available place atomically during approval");
    it.todo("allows only the applicant to withdraw an allowed state");
    it.todo("releases approved capacity atomically during withdrawal");
    it.todo("allows only an admin to delete and keeps approved capacity consistent");
  });
});
