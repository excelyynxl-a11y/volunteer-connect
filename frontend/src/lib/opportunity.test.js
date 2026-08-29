import { describe, expect, it } from "vitest";
import {
  getApplyEligibility,
  getRequirementItems,
  getSpotsRemaining,
  isOpportunityOpen,
} from "./opportunity";

describe("opportunity helpers", () => {
  it("calculates remaining capacity without going below zero", () => {
    expect(
      getSpotsRemaining({ maxVolunteers: 5, approvedVolunteersCount: 2 }),
    ).toBe(3);
    expect(
      getSpotsRemaining({ maxVolunteers: 5, approvedVolunteersCount: 8 }),
    ).toBe(0);
  });

  it("parses newline, bullet, and hyphen requirement lists", () => {
    expect(getRequirementItems("First aid\n• Teamwork\n- Communication")).toEqual([
      "First aid",
      "Teamwork",
      "Communication",
    ]);
  });

  it("only treats future active opportunities as open", () => {
    const now = Date.parse("2026-08-29T10:00:00Z");
    const base = {
      status: "Active",
      startAt: "2026-09-01T10:00:00Z",
      applicationDeadline: "2026-08-30T23:59:59Z",
    };

    expect(isOpportunityOpen(base, now)).toBe(true);
    expect(isOpportunityOpen({ ...base, status: "Completed" }, now)).toBe(false);
    expect(
      isOpportunityOpen({ ...base, startAt: "2026-08-29T09:59:59Z" }, now),
    ).toBe(false);
  });

  it("requires availability that fully covers the opportunity", () => {
    const opportunity = {
      startAt: "2026-08-31T10:00:00",
      endAt: "2026-08-31T12:00:00",
    };
    const availability = [
      { dayOfWeek: "Monday", startTime: "09:00", endTime: "13:00" },
    ];

    expect(getApplyEligibility(opportunity, availability)).toEqual({
      canApply: true,
      reason: "",
    });
    expect(getApplyEligibility(opportunity, [])).toMatchObject({ canApply: false });
  });
});
