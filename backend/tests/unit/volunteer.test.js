import { describe, expect, it } from "vitest";
import {
  parseArrayField,
  normalizeSkills,
} from "../../src/lib/volunteer.js";

describe("volunteer helper functions", () => {
    
  describe("parseArrayField", () => {
    it("returns undefined when the field is undefined", () => {
      expect(parseArrayField(undefined)).toBeUndefined();
    });

    it("returns an array unchanged when given an array", () => {
      const skills = ["JavaScript", "React"];

      expect(parseArrayField(skills)).toBe(skills);
    });

    it("parses a valid JSON string", () => {
      expect(
        parseArrayField('["JavaScript", "React"]'),
      ).toEqual(["JavaScript", "React"]);
    });

    it("returns the original string when JSON parsing fails", () => {
      const invalidJson = "JavaScript, React";

      expect(parseArrayField(invalidJson)).toBe(invalidJson);
    });

    it("returns non-string and non-array values unchanged", () => {
      expect(parseArrayField(null)).toBeNull();
      expect(parseArrayField(123)).toBe(123);
      expect(parseArrayField(true)).toBe(true);
    });
  });

  describe("normalizeSkills", () => {
    it("trims whitespace from skill names", () => {
      expect(
        normalizeSkills([" JavaScript ", " React "]),
      ).toEqual(["JavaScript", "React"]);
    });

    it("removes empty skill values", () => {
      expect(
        normalizeSkills(["JavaScript", "", "   ", "React"]),
      ).toEqual(["JavaScript", "React"]);
    });

    it("removes duplicate skills", () => {
      expect(
        normalizeSkills([
          "JavaScript",
          "React",
          "JavaScript",
          "React",
        ]),
      ).toEqual(["JavaScript", "React"]);
    });

    it("converts non-string skill values to strings", () => {
      expect(
        normalizeSkills(["JavaScript", 123, true]),
      ).toEqual(["JavaScript", "123", "true"]);
    });

    it("trims, removes empty values, and removes duplicates together", () => {
      expect(
        normalizeSkills([
          " JavaScript ",
          "React",
          " JavaScript",
          "",
          "   ",
          "React ",
        ]),
      ).toEqual(["JavaScript", "React"]);
    });
  });
});

