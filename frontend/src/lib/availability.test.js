import { describe, expect, it } from "vitest";
import {
  availabilitySlotsOverlap,
  getNewAvailabilitySlotError,
  getMinutesFromTime,
} from "./availability";

describe("availability helpers", () => {
  it("validates 24-hour time values", () => {
    expect(getMinutesFromTime("09:30")).toBe(570);
    expect(getMinutesFromTime("25:00")).toBeNull();
  });

  it("detects only same-day overlapping slots", () => {
    const existing = { dayOfWeek: "Monday", startTime: "09:00", endTime: "12:00" };
    expect(
      availabilitySlotsOverlap(existing, {
        dayOfWeek: "Monday",
        startTime: "11:00",
        endTime: "13:00",
      }),
    ).toBe(true);
    expect(
      availabilitySlotsOverlap(existing, {
        dayOfWeek: "Tuesday",
        startTime: "11:00",
        endTime: "13:00",
      }),
    ).toBe(false);
  });

  it("rejects invalid ranges and overlaps when adding a slot", () => {
    expect(
      getNewAvailabilitySlotError({ dayOfWeek: "Monday", startTime: "12:00", endTime: "11:00" }),
    ).toBe("End time must be later than start time.");
    expect(
      getNewAvailabilitySlotError(
        { dayOfWeek: "Monday", startTime: "11:00", endTime: "13:00" },
        [{ dayOfWeek: "Monday", startTime: "09:00", endTime: "12:00" }],
      ),
    ).toBe("Availability time ranges on the same day cannot overlap.");
  });
});
