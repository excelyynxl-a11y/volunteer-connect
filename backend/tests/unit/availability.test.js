import { describe, expect, it } from "vitest";
import {
  getAvailabilityValidationError,
  getMinutesFromTime,
  normalizeAvailability,
  sortAvailability,
} from "../../src/lib/availability.js";

describe("availability domain rules", () => {
  it("converts a valid 24-hour time into minutes", () => {
    expect(getMinutesFromTime("09:30")).toBe(570);
    expect(getMinutesFromTime("23:59")).toBe(1439);
  });

  it("rejects malformed or out-of-range times", () => {
    expect(getMinutesFromTime("9:30")).toBeNull();
    expect(getMinutesFromTime("24:00")).toBeNull();
    expect(getMinutesFromTime(null)).toBeNull();
  });

  it("trims slot values and supplies the default preference", () => {
    expect(
      normalizeAvailability([
        {
          dayOfWeek: " Monday ",
          startTime: " 09:00 ",
          endTime: " 11:00 ",
        },
      ]),
    ).toEqual([
      {
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "11:00",
        preference: "available",
      },
    ]);
  });

  it("preserves an explicitly supplied preference", () => { 
    expect(normalizeAvailability([
      { 
        dayOfWeek: "Monday",
        startTime: "09:00", 
        endTime: "11:00", 
        preference: " preferred ", },
      ]),
    ).toEqual([
      { 
        dayOfWeek: "Monday", 
        startTime: "09:00", 
        endTime: "11:00", 
        preference: "preferred",
      },
    ]);
  });

  it("rejects an invalid availability day", () => { 
    const error = getAvailabilityValidationError([ 
      { 
        dayOfWeek: "punday", 
        startTime: "09:00", 
        endTime: "10:00", 
        preference: "available", 
      }, 
    ]); 

    expect(error).toBe(
       "Each availability slot must include a valid dayOfWeek, startTime, endTime, and preference", 
    ); 
  });

  it("rejects an invalid availability preference", () => {
    const error = getAvailabilityValidationError([ 
      { 
        dayOfWeek: "Monday", 
        startTime: "09:00", 
        endTime: "10:00", 
        preference: "maybe", 
      }, 
    ]); 
    
    expect(error).toBe( 
      "Each availability slot must include a valid dayOfWeek, startTime, endTime, and preference",
    ); 
  });

  it("rejects a slot when start time equals end time", () => { 
    const error = getAvailabilityValidationError([ 
      { 
        dayOfWeek: "Monday", 
        startTime: "10:00", 
        endTime: "10:00", 
        preference: "available", 
      }, 
    ]); 
    
    expect(error).toBe(
      "Each availability slot must include a valid dayOfWeek, startTime, endTime, and preference", 
    ); 
  });

  it("rejects a slot when start time is after end time", () => { 
    const error = getAvailabilityValidationError([ 
      { 
        dayOfWeek: "Monday", 
        startTime: "11:00", 
        endTime: "10:00", 
        preference: "available", 
      }, 
    ]); 
    
    expect(error).toBe(
      "Each availability slot must include a valid dayOfWeek, startTime, endTime, and preference", 
    ); 
  });

  it("rejects invalid availability slot values", () => { 
    const error = getAvailabilityValidationError([ 
      null, 
    ]); 
    
    expect(error).toBe(
      "Each availability slot must include a valid dayOfWeek, startTime, endTime, and preference", 
    ); 
  }); 
  
  it("allows slots on different days even when their times overlap", () => { 
    const error = getAvailabilityValidationError([ 
      { 
        dayOfWeek: "Monday", 
        startTime: "09:00", 
        endTime: "11:00", 
        preference: "available", 
      }, 
      { 
        dayOfWeek: "Tuesday", 
        startTime: "09:30", 
        endTime: "10:30", 
        preference: "preferred", 
      }, 
    ]); 
    
    expect(error).toBe(""); 
  
  });

  it("allows adjacent slots on the same day", () => {
    const error = getAvailabilityValidationError([
      {
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        preference: "available",
      },
      {
        dayOfWeek: "Monday",
        startTime: "10:00",
        endTime: "11:00",
        preference: "preferred",
      },
    ]);

    expect(error).toBe("");
  });

  it("rejects overlapping slots on the same day", () => {
    const error = getAvailabilityValidationError([
      {
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "11:00",
        preference: "available",
      },
      {
        dayOfWeek: "Monday",
        startTime: "10:30",
        endTime: "12:00",
        preference: "preferred",
      },
    ]);

    expect(error).toBe("Availability slots on the same day must not overlap");
  });

  it("sorts slots by weekday and then start time without mutating the input", () => {
    const input = [
      {
        dayOfWeek: "Tuesday",
        startTime: "08:00",
        endTime: "09:00",
        preference: "available",
      },
      {
        dayOfWeek: "Monday",
        startTime: "14:00",
        endTime: "15:00",
        preference: "available",
      },
      {
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        preference: "preferred",
      },
    ];

    const sorted = sortAvailability(input);

    expect(sorted.map(({ dayOfWeek, startTime }) => [dayOfWeek, startTime])).toEqual([
      ["Monday", "09:00"],
      ["Monday", "14:00"],
      ["Tuesday", "08:00"],
    ]);
    expect(input[0].dayOfWeek).toBe("Tuesday");
  });
});
