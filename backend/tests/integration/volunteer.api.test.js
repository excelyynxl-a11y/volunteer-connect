import { describe, it } from "vitest";

describe("volunteer profile API", () => {
  it.todo("returns valid, invalid, and missing volunteer profile outcomes");
  it.todo("prevents a Volunteer from updating another Volunteer profile");
  it.todo("updates valid profile fields and preserves fields that were not supplied");
  it.todo("rejects invalid skills and availability received through multipart fields");
  it.todo("accepts a valid avatar and rejects invalid or oversized upload data");
  it.todo("returns only approved applications whose opportunities have ended as past experience");
});
