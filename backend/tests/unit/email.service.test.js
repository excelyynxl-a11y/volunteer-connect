import { describe, it } from "vitest";

describe("email service boundary (future)", () => {
  it.todo("renders the confirmed recipient, subject, and template data");
  it.todo("does not include private data that the recipient may not view");
  it.todo("sends through a mocked provider adapter in automated tests");
  it.todo("prevents duplicate delivery for the same notification event");
  it.todo("records and retries provider failure according to the future policy");
  it.todo("handles provider timeout without blocking the business request indefinitely");
});
