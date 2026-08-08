export const validAvailabilityDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const validAvailabilityPreferences = ["available", "preferred"];

const time24HourRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const getMinutesFromTime = (timeValue) => {
  if (typeof timeValue !== "string" || !time24HourRegex.test(timeValue)) {
    return null;
  }

  const [hours, minutes] = timeValue.split(":").map(Number);
  return hours * 60 + minutes;
};

export const normalizeAvailability = (availability) =>
  availability.map((slot) => {
    if (!slot || typeof slot !== "object" || Array.isArray(slot)) {
      return slot;
    }

    const preference =
      slot.preference === undefined
        ? "available"
        : typeof slot.preference === "string"
          ? slot.preference.trim()
          : slot.preference;

    return {
      dayOfWeek:
        typeof slot.dayOfWeek === "string"
          ? slot.dayOfWeek.trim()
          : slot.dayOfWeek,
      startTime:
        typeof slot.startTime === "string"
          ? slot.startTime.trim()
          : slot.startTime,
      endTime:
        typeof slot.endTime === "string"
          ? slot.endTime.trim()
          : slot.endTime,
      preference,
    };
  });

const isValidAvailabilitySlot = (slot) => {
  if (
    !slot ||
    typeof slot !== "object" ||
    Array.isArray(slot) ||
    !validAvailabilityDays.includes(slot.dayOfWeek) ||
    !validAvailabilityPreferences.includes(slot.preference)
  ) {
    return false;
  }

  const startMinutes = getMinutesFromTime(slot.startTime);
  const endMinutes = getMinutesFromTime(slot.endTime);

  return (
    startMinutes !== null &&
    endMinutes !== null &&
    startMinutes < endMinutes
  );
};

const slotsOverlap = (firstSlot, secondSlot) => {
  if (firstSlot.dayOfWeek !== secondSlot.dayOfWeek) {
    return false;
  }

  const firstStart = getMinutesFromTime(firstSlot.startTime);
  const firstEnd = getMinutesFromTime(firstSlot.endTime);
  const secondStart = getMinutesFromTime(secondSlot.startTime);
  const secondEnd = getMinutesFromTime(secondSlot.endTime);

  return firstStart < secondEnd && secondStart < firstEnd;
};

export const getAvailabilityValidationError = (availability) => {
  if (!availability.every(isValidAvailabilitySlot)) {
    return "Each availability slot must include a valid dayOfWeek, startTime, endTime, and preference";
  }

  for (let index = 0; index < availability.length; index += 1) {
    for (
      let comparisonIndex = index + 1;
      comparisonIndex < availability.length;
      comparisonIndex += 1
    ) {
      if (slotsOverlap(availability[index], availability[comparisonIndex])) {
        return "Availability slots on the same day must not overlap";
      }
    }
  }

  return "";
};

export const sortAvailability = (availability) =>
  [...availability].sort((firstSlot, secondSlot) => {
    const dayDifference =
      validAvailabilityDays.indexOf(firstSlot.dayOfWeek) -
      validAvailabilityDays.indexOf(secondSlot.dayOfWeek);

    if (dayDifference !== 0) {
      return dayDifference;
    }

    return (
      getMinutesFromTime(firstSlot.startTime) -
      getMinutesFromTime(secondSlot.startTime)
    );
  });

// Target timezone for local application execution (adjusts Docker UTC ISO timestamps)
const TARGET_TIMEZONE = process.env.TZ || "Asia/Kuala_Lumpur";

/**
 * Extracts minutes from midnight for a given ISO Date in the target timezone
 */
const getMinutesInTimezone = (date, timeZone = TARGET_TIMEZONE) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone,
  }).formatToParts(date);

  let hours = 0;
  let minutes = 0;
  for (const part of parts) {
    if (part.type === "hour") hours = parseInt(part.value, 10) % 24;
    if (part.type === "minute") minutes = parseInt(part.value, 10);
  }
  return hours * 60 + minutes;
};

/**
 * Checks if an opportunity's start and end times fall completely within
 * at least one of the volunteer's registered availability slots.
 */
export const isOpportunityInsideAvailability = (
  opportunity,
  availabilitySlots = []
) => {
  if (
    !opportunity?.startAt ||
    !opportunity?.endAt ||
    !Array.isArray(availabilitySlots) ||
    availabilitySlots.length === 0
  ) {
    return false;
  }

  const startDate = new Date(opportunity.startAt);
  const endDate = new Date(opportunity.endAt);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return false;
  }

  // Get local weekday name in target timezone (e.g., "Sunday")
  const opportunityDay = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: TARGET_TIMEZONE,
  });

  const opportunityStartMin = getMinutesInTimezone(startDate);
  const opportunityEndMin = getMinutesInTimezone(endDate);

  return availabilitySlots.some((slot) => {
    if (
      !slot?.dayOfWeek ||
      slot.dayOfWeek.trim().toLowerCase() !== opportunityDay.toLowerCase()
    ) {
      return false;
    }

    const slotStartMin = getMinutesFromTime(slot.startTime);
    const slotEndMin = getMinutesFromTime(slot.endTime);

    if (slotStartMin === null || slotEndMin === null) return false;

    return (
      opportunityStartMin >= slotStartMin && opportunityEndMin <= slotEndMin
    );
  });
};