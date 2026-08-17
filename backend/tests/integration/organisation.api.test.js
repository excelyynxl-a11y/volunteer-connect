import { describe, it } from "vitest";

describe("organisation profile API", () => {
  it.todo("returns only safe public fields for an approved organisation");
  it.todo("returns not found for a missing, pending, or rejected organisation");
  it.todo("allows only an Organisation to update its authenticated profile");
  it.todo("updates valid fields while preserving fields that were not supplied");
  it.todo("accepts a valid avatar and rejects invalid or oversized upload data");
});
