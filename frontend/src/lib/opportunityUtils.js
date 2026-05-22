export const opportunityCategories = [
  "Environment",
  "Education",
  "Health",
  "Community",
  "Animal Welfare",
  "Elderly Care",
  "Disability Support",
  "Event Support",
  "Fundraising",
  "Other",
];

export const defaultAvailabilityPreview = [
  { dayOfWeek: "Monday", startTime: "08:00", endTime: "19:00" },
  { dayOfWeek: "Wednesday", startTime: "10:00", endTime: "18:00" },
];

export const formatOpportunityDate = (dateValue) => {
  if (!dateValue) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
};

export const formatOpportunityTime = (dateValue) => {
  if (!dateValue) return "";

  return new Intl.DateTimeFormat("en-MY", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(dateValue))
    .toLowerCase();
};

export const formatOpportunityTimeRange = (startAt, endAt, fallback = "") => {
  if (!startAt || !endAt) return fallback;

  return `${formatOpportunityTime(startAt)} - ${formatOpportunityTime(endAt)}`;
};

export const shortDay = (day) => (day ? day.slice(0, 3) : "Day");

export const getOpportunityImage = (opportunity) => {
  if (!Array.isArray(opportunity?.images)) return "";
  return opportunity.images.find(Boolean) || "";
};

export const getOrganisationName = (opportunity) =>
  opportunity?.organisationId?.name ||
  opportunity?.organisationName ||
  "Organisation";

export const opportunityMatchesSearch = (opportunity, searchQuery) => {
  const terms = searchQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (terms.length === 0) return true;

  const searchableText = [
    opportunity?.title,
    opportunity?.details,
    opportunity?.location,
    opportunity?.requirements,
    getOrganisationName(opportunity),
    ...(Array.isArray(opportunity?.category) ? opportunity.category : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return terms.every((term) => searchableText.includes(term));
};

export const getSpotsRemaining = (opportunity) =>
  Math.max(
    (opportunity?.maxVolunteers || 0) -
      (opportunity?.approvedVolunteersCount || 0),
    0,
  );

export const getRequirementItems = (requirements = "") =>
  requirements
    .split(/\n|\u2022|-/)
    .map((requirement) => requirement.trim())
    .filter(Boolean);

export const getWeekdayName = (dateValue) => {
  if (!dateValue) return "";

  return new Intl.DateTimeFormat("en-MY", {
    weekday: "long",
  }).format(new Date(dateValue));
};

export const getMinutesFromTime = (timeValue) => {
  if (!timeValue) return null;

  const [hours, minutes] = timeValue.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

export const getMinutesFromDate = (dateValue) => {
  if (!dateValue) return null;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getHours() * 60 + date.getMinutes();
};

export const isOpportunityInsideAvailability = (
  opportunity,
  availabilitySlots = [],
) => {
  if (
    !opportunity?.startAt ||
    !opportunity?.endAt ||
    availabilitySlots.length === 0
  ) {
    return false;
  }

  const opportunityStartDay = getWeekdayName(opportunity.startAt);
  const opportunityEndDay = getWeekdayName(opportunity.endAt);

  if (opportunityStartDay !== opportunityEndDay) {
    return false;
  }

  const opportunityStart = getMinutesFromDate(opportunity.startAt);
  const opportunityEnd = getMinutesFromDate(opportunity.endAt);

  if (opportunityStart === null || opportunityEnd === null) {
    return false;
  }

  return availabilitySlots.some((slot) => {
    const slotStart = getMinutesFromTime(slot.startTime);
    const slotEnd = getMinutesFromTime(slot.endTime);

    if (slotStart === null || slotEnd === null) {
      return false;
    }

    return (
      slot.dayOfWeek === opportunityStartDay &&
      opportunityStart >= slotStart &&
      opportunityEnd <= slotEnd
    );
  });
};
