import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/models/user.model.js", () => ({
  Volunteer: { find: vi.fn() },
  Organisation: { find: vi.fn() },
}));
vi.mock("../../src/models/opportunity.model.js", () => ({
  default: { find: vi.fn() },
}));
vi.mock("../../src/models/report.model.js", () => ({
  default: { find: vi.fn() },
}));

import { Organisation, Volunteer } from "../../src/models/user.model.js";
import Opportunity from "../../src/models/opportunity.model.js";
import Report from "../../src/models/report.model.js";
import {
  getOpportunityCreatedAnalytics,
  getOrganisationSignUpAnalytics,
  getReportAnalytics,
  getVolunteerSignUpAnalytics,
  resolveRange,
} from "../../src/controllers/analytics.controller.js";

const createQuery = (value) => {
  const query = { populate: vi.fn(), sort: vi.fn(), then: (resolve, reject) => Promise.resolve(value).then(resolve, reject) };
  query.populate.mockReturnValue(query);
  query.sort.mockReturnValue(query);
  return query;
};

const createResponse = () => {
  const res = { body: null };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn((body) => {
    res.body = body;
    return res;
  });
  return res;
};

describe("analytics range validation", () => {
  it("accepts a valid range and returns exclusive end boundaries", () => {
    const range = resolveRange({ startMonth: "2026-01", endMonth: "2026-03" });

    expect(range.startMonth).toBe("2026-01");
    expect(range.endMonth).toBe("2026-03");
    expect(range.rangeStart.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(range.rangeEnd.toISOString()).toBe("2026-04-01T00:00:00.000Z");
  });

  it("rejects malformed, reversed, and oversized ranges", () => {
    expect(() => resolveRange({ startMonth: "2026-1", endMonth: "2026-03" })).toThrow("YYYY-MM");
    expect(() => resolveRange({ startMonth: "2026-04", endMonth: "2026-03" })).toThrow("before or equal");
    expect(() => resolveRange({ startMonth: "2020-01", endMonth: "2026-03" })).toThrow("cannot exceed");
  });
});

describe("analytics controllers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns zero-filled volunteer and organisation signup months and excludes deleted users", async () => {
    const volunteer = { name: "Alex", email: "alex@example.com", createdAt: new Date("2026-01-10T00:00:00Z") };
    const organisation = { name: "Helping Hands", email: "org@example.com", createdAt: new Date("2026-02-10T00:00:00Z") };
    Volunteer.find.mockReturnValue(createQuery([volunteer]));
    Organisation.find.mockReturnValue(createQuery([organisation]));

    const volunteerRes = createResponse();
    await getVolunteerSignUpAnalytics({ query: { startMonth: "2026-01", endMonth: "2026-03" } }, volunteerRes);
    expect(Volunteer.find).toHaveBeenCalledWith({
      deletedAt: null,
      createdAt: { $gte: new Date("2026-01-01T00:00:00.000Z"), $lt: new Date("2026-04-01T00:00:00.000Z") },
    }, "name email createdAt");
    expect(volunteerRes.body).toHaveLength(3);
    expect(volunteerRes.body[0]).toMatchObject({ month: "2026-01", count: 1 });
    expect(volunteerRes.body[1]).toMatchObject({ month: "2026-02", count: 0 });

    const organisationRes = createResponse();
    await getOrganisationSignUpAnalytics({ query: { startMonth: "2026-01", endMonth: "2026-03" } }, organisationRes);
    expect(organisationRes.body[1]).toMatchObject({ month: "2026-02", count: 1 });
  });

  it("groups opportunities and reports with safe projections", async () => {
    Opportunity.find.mockReturnValue(createQuery([{
      title: "Cleanup",
      organisationId: { name: "Helping Hands", email: "org@example.com" },
      maxVolunteers: 10,
      createdAt: new Date("2026-03-05T00:00:00Z"),
      startAt: new Date("2026-04-01T00:00:00Z"),
    }]));
    const opportunityRes = createResponse();
    await getOpportunityCreatedAnalytics({ query: { startMonth: "2026-03", endMonth: "2026-03" } }, opportunityRes);
    expect(Opportunity.find).toHaveBeenCalledWith(expect.objectContaining({ deletedAt: null }), "title organisationId maxVolunteers createdAt startAt");
    expect(opportunityRes.body[0].opportunities[0]).toMatchObject({
      title: "Cleanup",
      organisationName: "Helping Hands",
      maxVolunteers: 10,
    });

    Report.find.mockReturnValue(createQuery([{
      title: "Unsafe site",
      reportType: "OpportunityViolation",
      status: "Pending",
      createdAt: new Date("2026-03-07T00:00:00Z"),
    }]));
    const reportRes = createResponse();
    await getReportAnalytics({ query: { startMonth: "2026-03", endMonth: "2026-03" } }, reportRes);
    expect(reportRes.body[0].reports[0]).toMatchObject({ title: "Unsafe site", status: "Pending" });
  });

  it("returns 400 for an invalid range and 500 for a data query failure", async () => {
    const invalidRes = createResponse();
    await getReportAnalytics({ query: { startMonth: "2026-13", endMonth: "2026-03" } }, invalidRes);
    expect(invalidRes.status).toHaveBeenCalledWith(400);

    Report.find.mockImplementation(() => { throw new Error("database unavailable"); });
    const failureRes = createResponse();
    await getReportAnalytics({ query: { startMonth: "2026-01", endMonth: "2026-01" } }, failureRes);
    expect(failureRes.status).toHaveBeenCalledWith(500);
    expect(failureRes.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});
