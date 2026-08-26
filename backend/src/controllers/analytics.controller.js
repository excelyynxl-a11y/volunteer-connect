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

export const getVolunteerSignUpAnalytics = async (req, res) => {
    // example output:
    // [{month, count, volunteers [{name, email, signUpAt}]}]

    try {
        // extract start - end month
        const { startMonth, endMonth } = resolveRange(req.query);
        const rangeStart = parseMonth(startMonth);
        const rangeEnd = parseMonth(endMonth);
        rangeEnd.setUTCMonth(rangeEnd.getUTCMonth() + 1); 

        const volunteers = await Volunteer.find(
            {createdAt: 
                { 
                    $gte: rangeStart, 
                    $lt: rangeEnd 
                }
            }, "name email createdAt",
        ).sort({ createdAt: 1 });

        // group volunteers by month
        const grouped = {};
        for (const month of generateMonthRange(startMonth, endMonth)) {
            grouped[month] = { month, count: 0, volunteers: [] };
        }

        // generate count of volunteer in each month
        for (const v of volunteers) {
        const key = toMonthKey(v.createdAt);
        if (grouped[key]) {
            grouped[key].count += 1;
            grouped[key].volunteers.push({
            name: v.name,
            email: v.email,
            signedUpAt: v.createdAt,
            });
        }
        }

        res.status(200).json(Object.values(grouped));
    } catch (err) {
        console.log("Error in getVolunteerSignUpAnalytics controller: ", err.message);
        res.status(500).json({ message: err.message });
    }
};

export const getOrganisationSignUpAnalytics = async (req, res) => {
    // example output:
    // [{month, count, org [{name, email, signUpAt}]}]

    try {
        // extract start - end month
        const { startMonth, endMonth } = resolveRange(req.query);
        const rangeStart = parseMonth(startMonth);
        const rangeEnd = parseMonth(endMonth);
        rangeEnd.setUTCMonth(rangeEnd.getUTCMonth() + 1);

        const organisations = await Organisation.find(
            { createdAt: { $gte: rangeStart, $lt: rangeEnd } },
            "name email createdAt",
        ).sort({ createdAt: 1 });

        // group org by month
        const grouped = {};
        for (const month of generateMonthRange(startMonth, endMonth)) {
            grouped[month] = { month, count: 0, organisations: [] };
        }

    // generate count of volunteer in each month
    for (const org of organisations) {
        const key = toMonthKey(org.createdAt);
        if (grouped[key]) {
            grouped[key].count += 1;
            grouped[key].organisations.push({
            name: org.name,
            email: org.email,
            signedUpAt: org.createdAt,
            });
        }
    }

    res.status(200).json(Object.values(grouped));
  } catch (err) {
        console.log("Error in getOrganisationSignUpAnalytics controller: ", err.message);
        res.status(500).json({ message: err.message });
  }
};

export const getOpportunityCreatedAnalytics = async (req, res) => {
    // example output:
    // [month, count, opportunities[{title, organisationName, organisationEmail, maxVolunteers, createdAt, eventDate}]]

    try {
        // extract start - end month
        const { startMonth, endMonth } = resolveRange(req.query);
        const rangeStart = parseMonth(startMonth);
        const rangeEnd = parseMonth(endMonth);
        rangeEnd.setUTCMonth(rangeEnd.getUTCMonth() + 1);

        const opportunities = await Opportunity.find(
            { createdAt: { $gte: rangeStart, $lt: rangeEnd } },
            "title organisationId maxVolunteers createdAt startAt",
        )
        .populate("organisationId", "name email")
        .sort({ createdAt: 1 });

        // group opportunity by month
        const grouped = {};
        for (const month of generateMonthRange(startMonth, endMonth)) {
            grouped[month] = { month, count: 0, opportunities: [] };
        }

        // generate count of volunteer in each month
        for (const opp of opportunities) {
            const key = toMonthKey(opp.createdAt);
            if (grouped[key]) {
                grouped[key].count += 1;
                grouped[key].opportunities.push({
                    title: opp.title,
                    organisationName: opp.organisationId?.name ?? "Unknown",
                    organisationEmail: opp.organisationId?.email ?? "",
                    maxVolunteers: opp.maxVolunteers,
                    createdAt: opp.createdAt,
                    eventDate: opp.startAt,
                });
            }
        }

        res.status(200).json(Object.values(grouped));
    } catch (err) {
        console.log("Error in getOpportunityCreatedAnalytics controller: ", err.message);
        res.status(500).json({ message: err.message });
    }
};

export const getReportAnalytics = async (req, res) => {
    // example output:
    // [month, count, reports[{title, reportType, status, createdAt}]]
    
    // extract start - end month
    try {
        const { startMonth, endMonth } = resolveRange(req.query);
        const rangeStart = parseMonth(startMonth);
        const rangeEnd = parseMonth(endMonth);
        rangeEnd.setUTCMonth(rangeEnd.getUTCMonth() + 1);

        // group report by month
        const reports = await Report.find(
            { createdAt: { $gte: rangeStart, $lt: rangeEnd } },
            "title reportType status createdAt",
        ).sort({ createdAt: 1 });

        const grouped = {};
        for (const month of generateMonthRange(startMonth, endMonth)) {
            grouped[month] = { month, count: 0, reports: [] };
        }

        // generate count of volunteer in each month
        for (const report of reports) {
        const key = toMonthKey(report.createdAt);
        if (grouped[key]) {
            grouped[key].count += 1;
            grouped[key].reports.push({
                title: report.title,
                reportType: report.reportType,
                status: report.status,
                createdAt: report.createdAt,
            });
        }
        }

        res.status(200).json(Object.values(grouped));
    } catch (err) {
        console.log("Error in getReportAnalytics controller: ", err.message);
        res.status(500).json({ message: err.message });
    }
};

