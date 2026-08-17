import { describe, it } from "vitest";

describe("report controller", () => {
  describe("create", () => {
    it.todo("validates report type, title, and details");
    it.todo("allows a volunteer to report only an existing opportunity");
    it.todo("allows an organisation to report only an existing user");
    it.todo("prevents an admin or unsupported role from submitting a report");
    it.todo("validates the matching violation subtype and target ID");
    it.todo("creates and returns a populated report using the authenticated submitter");
  });

  describe("read, update, and delete", () => {
    it.todo("lists only reports submitted by the authenticated user");
    it.todo("returns all reports in newest-first order for an admin");
    it.todo("validates report IDs and missing-report outcomes");
    it.todo("accepts only the supported report status values");
    it.todo("returns the populated report after a status update");
    it.todo("deletes an existing report and handles query failures safely");
  });
});
