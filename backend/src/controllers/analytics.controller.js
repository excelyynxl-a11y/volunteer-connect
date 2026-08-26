import { Organisation, Volunteer } from "../models/user.model.js";
import Opportunity from "../models/opportunity.model.js";
import Report from "../models/report.model.js";

const DEFAULT_START_MONTH = "2026-03";


// Parse a "YYYY-MM" string into a Date (first day of month, midnight UTC).
const parseMonth = (monthStr) => new Date(`${monthStr}-01T00:00:00.000Z`);


// Return the "YYYY-MM" key for a given Date.
const toMonthKey = (date) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};


// Generate an ordered array of "YYYY-MM" keys between start and end (inclusive).
const generateMonthRange = (startMonth, endMonth) => {
  const months = [];
  const cursor = parseMonth(startMonth);
  const end = parseMonth(endMonth);
  while (cursor <= end) {
    months.push(toMonthKey(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
};

// Resolve start/end month from query params with sensible defaults.
const resolveRange = (query) => {
  const now = new Date();
  const defaultEnd = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const startMonth = query.startMonth || DEFAULT_START_MONTH;
  const endMonth = query.endMonth || defaultEnd;
  return { startMonth, endMonth };
};



