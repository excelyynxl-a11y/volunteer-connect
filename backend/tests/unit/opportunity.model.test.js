import { describe, it } from "vitest";

describe("opportunity model", () => {
  it.todo("requires title, details, organisation, location, dates, and capacity");
  it.todo("rejects unsupported category and status values");
  it.todo("requires the end time to be after the start time");
  it.todo("requires the application deadline to be before the start time");
  it.todo("prevents approved volunteers from exceeding maximum capacity");
  it.todo("calculates remaining spots and full state without negative values");
});
