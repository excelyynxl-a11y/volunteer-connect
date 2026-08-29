import { describe, expect, it } from "vitest";

import { parsePagination } from "../../src/lib/pagination.js";

describe("pagination input", () => {
  it("uses safe defaults and calculates the offset", () => {
    expect(parsePagination()).toEqual({ page: 1, limit: 25, skip: 0 });
    expect(parsePagination({ page: "3", limit: "10" })).toEqual({
      page: 3,
      limit: 10,
      skip: 20,
    });
  });

  it("rejects invalid or excessive page sizes", () => {
    expect(() => parsePagination({ page: "0" })).toThrow("positive integer");
    expect(() => parsePagination({ limit: "101" })).toThrow("between 1 and 100");
  });
});
