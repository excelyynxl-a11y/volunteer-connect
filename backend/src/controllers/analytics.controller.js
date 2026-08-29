import { Organisation, Volunteer } from "../models/user.model.js";
import Opportunity from "../models/opportunity.model.js";
import Report from "../models/report.model.js";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const MAX_ANALYTICS_MONTHS = 24;

const parseMonth = (month) => new Date(`${month}-01T00:00:00.000Z`);

const toMonthKey = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const monthIndex = (month) => {
  const date = parseMonth(month);
  return date.getUTCFullYear() * 12 + date.getUTCMonth();
};

const getDefaultStartMonth = () => {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - (MAX_ANALYTICS_MONTHS - 1));
  return toMonthKey(date);
};

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

export const resolveRange = (query = {}) => {
  const now = new Date();
  const defaultEnd = toMonthKey(now);
  const startMonth = query.startMonth || getDefaultStartMonth();
  const endMonth = query.endMonth || defaultEnd;

  if (!MONTH_PATTERN.test(startMonth) || !MONTH_PATTERN.test(endMonth)) {
    throw new Error("startMonth and endMonth must use YYYY-MM format");
  }

  const startIndex = monthIndex(startMonth);
  const endIndex = monthIndex(endMonth);
  if (startIndex > endIndex) {
    throw new Error("startMonth must be before or equal to endMonth");
  }

  if (endIndex - startIndex + 1 > MAX_ANALYTICS_MONTHS) {
    throw new Error(`Analytics range cannot exceed ${MAX_ANALYTICS_MONTHS} months`);
  }

  const rangeStart = parseMonth(startMonth);
  const rangeEnd = parseMonth(endMonth);
  rangeEnd.setUTCMonth(rangeEnd.getUTCMonth() + 1);

  return { startMonth, endMonth, rangeStart, rangeEnd };
};

const getRangeOrRespond = (req, res) => {
  try {
    return resolveRange(req.query);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
    return null;
  }
};

const createGroupedResult = (startMonth, endMonth, nestedKey) =>
  Object.fromEntries(
    generateMonthRange(startMonth, endMonth).map((month) => [
      month,
      { month, count: 0, [nestedKey]: [] },
    ]),
  );

export const getVolunteerSignUpAnalytics = async (req, res) => {
  try {
    const range = getRangeOrRespond(req, res);
    if (!range) return;

    const volunteers = await Volunteer.find(
      {
        deletedAt: null,
        createdAt: { $gte: range.rangeStart, $lt: range.rangeEnd },
      },
      "name email createdAt",
    ).sort({ createdAt: 1 });

    const grouped = createGroupedResult(range.startMonth, range.endMonth, "volunteers");
    for (const volunteer of volunteers) {
      const month = grouped[toMonthKey(volunteer.createdAt)];
      if (!month) continue;
      month.count += 1;
      month.volunteers.push({
        name: volunteer.name,
        email: volunteer.email,
        signedUpAt: volunteer.createdAt,
      });
    }

    return res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.log("Error in volunteer signup analytics: ", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOrganisationSignUpAnalytics = async (req, res) => {
  try {
    const range = getRangeOrRespond(req, res);
    if (!range) return;

    const organisations = await Organisation.find(
      {
        deletedAt: null,
        createdAt: { $gte: range.rangeStart, $lt: range.rangeEnd },
      },
      "name email createdAt",
    ).sort({ createdAt: 1 });

    const grouped = createGroupedResult(range.startMonth, range.endMonth, "organisations");
    for (const organisation of organisations) {
      const month = grouped[toMonthKey(organisation.createdAt)];
      if (!month) continue;
      month.count += 1;
      month.organisations.push({
        name: organisation.name,
        email: organisation.email,
        signedUpAt: organisation.createdAt,
      });
    }

    return res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.log("Error in organisation signup analytics: ", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOpportunityCreatedAnalytics = async (req, res) => {
  try {
    const range = getRangeOrRespond(req, res);
    if (!range) return;

    const opportunities = await Opportunity.find(
      {
        deletedAt: null,
        createdAt: { $gte: range.rangeStart, $lt: range.rangeEnd },
      },
      "title organisationId maxVolunteers createdAt startAt",
    )
      .populate("organisationId", "name email")
      .sort({ createdAt: 1 });

    const grouped = createGroupedResult(range.startMonth, range.endMonth, "opportunities");
    for (const opportunity of opportunities) {
      const month = grouped[toMonthKey(opportunity.createdAt)];
      if (!month) continue;
      month.count += 1;
      month.opportunities.push({
        title: opportunity.title,
        organisationName: opportunity.organisationId?.name ?? "Unknown",
        organisationEmail: opportunity.organisationId?.email ?? "",
        maxVolunteers: opportunity.maxVolunteers,
        createdAt: opportunity.createdAt,
        eventDate: opportunity.startAt,
      });
    }

    return res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.log("Error in opportunity analytics: ", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getReportAnalytics = async (req, res) => {
  try {
    const range = getRangeOrRespond(req, res);
    if (!range) return;

    const reports = await Report.find(
      { createdAt: { $gte: range.rangeStart, $lt: range.rangeEnd } },
      "title reportType status createdAt",
    ).sort({ createdAt: 1 });

    const grouped = createGroupedResult(range.startMonth, range.endMonth, "reports");
    for (const report of reports) {
      const month = grouped[toMonthKey(report.createdAt)];
      if (!month) continue;
      month.count += 1;
      month.reports.push({
        title: report.title,
        reportType: report.reportType,
        status: report.status,
        createdAt: report.createdAt,
      });
    }

    return res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.log("Error in report analytics: ", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
