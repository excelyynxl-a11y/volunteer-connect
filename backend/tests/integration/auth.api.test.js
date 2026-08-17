import { describe, it } from "vitest";

describe("authentication API", () => {
  it.todo("creates a pending volunteer with a valid PDF resume and no JWT");
  it.todo("creates a pending organisation with required biodata and no JWT");
  it.todo("rejects invalid signup fields and a duplicate normalised email");
  it.todo("blocks pending and rejected login while approved login sets a JWT cookie");
  it.todo("returns the approved authenticated user from me and check routes");
  it.todo("rejects missing, invalid, expired, and deleted-user sessions");
  it.todo("clears the JWT cookie on logout");
  it.todo("enforces representative Volunteer, Organisation, and Admin routes");
});
