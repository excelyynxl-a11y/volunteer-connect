import { describe, it } from "vitest";

describe("report model", () => {
  it.todo("requires submitter, report type, title, details, and a valid status");
  it.todo("requires the user subtype and target only for a user violation");
  it.todo("requires the opportunity subtype and target only for an opportunity violation");
  it.todo("rejects unsupported violation subtypes");
  it.todo("trims and limits the report title");
});
