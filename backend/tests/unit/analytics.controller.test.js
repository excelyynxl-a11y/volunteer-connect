import { describe, expect, it } from "vitest";

import { resolveRange } from "../../src/controllers/analytics.controller.js";

describe("analytics range validation", () => {
  it("accepts a valid range and returns exclusive end boundaries", () => {
    const range = resolveRange({ startMonth: "2026-01", endMonth: "2026-03" });

    expect(range.startMonth).toBe("2026-01");
    expect(range.endMonth).toBe("2026-03");
    expect(range.rangeStart.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(range.rangeEnd.toISOString()).toBe("2026-04-01T00:00:00.000Z");
  });

  it("rejects malformed, reversed, and oversized ranges", () => {
    expect(() => resolveRange({ startMonth: "2026-1", endMonth: "2026-03" })).toThrow(
      "YYYY-MM",
    );
    expect(() => resolveRange({ startMonth: "2026-04", endMonth: "2026-03" })).toThrow(
      "before or equal",
    );
    expect(() => resolveRange({ startMonth: "2020-01", endMonth: "2026-03" })).toThrow(
      "cannot exceed",
    );
  });
});
