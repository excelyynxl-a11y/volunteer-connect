import { describe, it } from "vitest";

describe("opportunity API", () => {
  it.todo("allows an approved Organisation to create a valid opportunity it owns");
  it.todo("rejects unauthenticated, wrong-role, invalid, and boundary create requests");
  it.todo("lists opportunities and returns valid, invalid, and missing details");
  it.todo("lists only opportunities owned by the authenticated Organisation");
  it.todo("allows only the owner or an Admin to update an opportunity");
  it.todo("prevents capacity from dropping below the approved application count");
  it.todo("preserves valid date and status invariants during partial update");
  it.todo("allows only an Admin to delete an opportunity");
});
