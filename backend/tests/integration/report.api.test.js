import { describe, it } from "vitest";

describe("report API", () => {
  it.todo("allows a Volunteer to report an existing Opportunity only");
  it.todo("allows an Organisation to report an existing User only");
  it.todo("rejects invalid subtype, target, title, details, and unsupported submitter role");
  it.todo("returns only reports submitted by the authenticated user");
  it.todo("allows only an Admin to list, read, update, and delete all reports");
  it.todo("persists only supported status transitions and returns populated data");
  it.todo("handles invalid, missing, and repeated report operations safely");
});
