import { describe, it } from "vitest";

describe("application API", () => {
  it.todo("allows an approved Volunteer to apply to an eligible opportunity");
  it.todo("rejects invalid, missing, non-active, deadline-passed, full, and unavailable opportunities");
  it.todo("rejects sequential and concurrent duplicate applications");
  it.todo("returns only the authenticated Volunteer applications and valid filters");
  it.todo("returns only applications for the authenticated Organisation opportunities");
  it.todo("shows application detail only to the applicant, owning Organisation, or Admin");
  it.todo("allows only the owning Organisation to approve or reject pending applications");
  it.todo("prevents two approvals from taking the final available place");
  it.todo("allows only the applicant to withdraw an allowed state");
  it.todo("releases reserved capacity when an approved application is withdrawn");
  it.todo("allows only an Admin to delete while preserving capacity consistency");
});
