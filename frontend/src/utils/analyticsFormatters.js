export const formatMonthLabel = (monthKey) => {
  if (!monthKey || typeof monthKey !== "string") {
    return "Unknown";
  }

  const [year, month] = monthKey.split("-");
  const yearNumber = Number(year);
  const monthNumber = Number(month);

  if (!Number.isFinite(yearNumber) || !Number.isFinite(monthNumber)) {
    return monthKey;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(yearNumber, monthNumber - 1, 1)));
};

export const formatDateValue = (value) => {
  if (!value) {
    return "Unknown date";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(parsedDate);
};
