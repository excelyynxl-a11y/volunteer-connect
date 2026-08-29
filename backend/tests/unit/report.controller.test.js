import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createReport,
  deleteReport,
  getAllReports,
  getMyReports,
  getReportById,
  updateReportStatus,
} from "../../src/controllers/report.controller.js";
import Application from "../../src/models/application.model.js";
import Opportunity from "../../src/models/opportunity.model.js";
import Report from "../../src/models/report.model.js";
import { User } from "../../src/models/user.model.js";

vi.mock("../../src/models/report.model.js", () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    countDocuments: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));
vi.mock("../../src/models/opportunity.model.js", () => ({
  default: { findById: vi.fn(), find: vi.fn() },
}));
vi.mock("../../src/models/application.model.js", () => ({
  default: { findOne: vi.fn() },
}));
vi.mock("../../src/models/user.model.js", () => ({
  User: { findById: vi.fn() },
}));

const ids = {
  report: "507f191e810c19729de860e1",
  submitter: "507f191e810c19729de860e2",
  volunteer: "507f191e810c19729de860e3",
  opportunity: "507f191e810c19729de860e4",
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

const createQuery = (value) => {
  const query = {
    select: vi.fn(),
    populate: vi.fn(),
    sort: vi.fn(),
    skip: vi.fn(),
    limit: vi.fn(),
    then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
  };
  for (const method of ["select", "populate", "sort", "skip", "limit"]) {
    query[method].mockReturnValue(query);
  }
  return query;
};

const volunteerRequest = (body = {}) => ({
  user: { _id: ids.submitter, role: "volunteer" },
  body,
  query: {},
});

const organisationRequest = (body = {}) => ({
  user: { _id: ids.submitter, role: "organisation" },
  body,
  query: {},
});

describe("report controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Report.countDocuments.mockResolvedValue(0);
  });

  it("validates report type, title, details, role, and subtype", async () => {
    const invalidBodies = [
      { reportType: "Unknown", title: "Title", details: "Details" },
      { reportType: "OpportunityViolation", title: "  ", details: "Details" },
      { reportType: "OpportunityViolation", title: "Title", details: "" },
      {
        reportType: "OpportunityViolation",
        opportunityViolationType: "Unsupported",
        reportedOpportunityId: ids.opportunity,
        title: "Title",
        details: "Details",
      },
    ];
    for (const body of invalidBodies) {
      const res = createResponse();
      await createReport(volunteerRequest(body), res);
      expect(res.status).toHaveBeenCalledWith(400);
    }

    const adminRes = createResponse();
    await createReport({ user: { _id: "admin", role: "admin" }, body: invalidBodies[0] }, adminRes);
    expect(adminRes.status).toHaveBeenCalledWith(400);
    expect(Report.create).not.toHaveBeenCalled();
  });

  it("allows a volunteer to report an applied opportunity and prevents self/unrelated targets", async () => {
    const body = {
      reportType: "OpportunityViolation",
      opportunityViolationType: "Hazardous Environment",
      reportedOpportunityId: ids.opportunity,
      title: "Unsafe site",
      details: "Protective equipment was unavailable.",
    };
    Opportunity.findById.mockReturnValue({ select: vi.fn().mockResolvedValue({ _id: ids.opportunity }) });
    Application.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue({ _id: "application" }) });
    Report.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });
    Report.create.mockResolvedValue({ _id: ids.report });
    Report.findById.mockReturnValue(createQuery({ _id: ids.report }));
    const res = createResponse();

    await createReport(volunteerRequest(body), res);

    expect(Application.findOne).toHaveBeenCalledWith({
      volunteerId: ids.submitter,
      opportunityId: ids.opportunity,
    });
    expect(Report.create).toHaveBeenCalledWith(expect.objectContaining({
      submittedBy: ids.submitter,
      reportedOpportunityId: ids.opportunity,
    }));
    expect(res.status).toHaveBeenCalledWith(201);

    Application.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });
    const unrelatedRes = createResponse();
    await createReport(volunteerRequest(body), unrelatedRes);
    expect(unrelatedRes.status).toHaveBeenCalledWith(403);
  });

  it("allows an organisation to report only a connected volunteer", async () => {
    const body = {
      reportType: "UserViolation",
      userViolationType: "Not Punctual",
      reportedUserId: ids.volunteer,
      title: "Late arrival",
      details: "The volunteer arrived after the shift ended.",
    };
    User.findById.mockReturnValue({ select: vi.fn().mockResolvedValue({ _id: ids.volunteer, role: "volunteer" }) });
    Opportunity.find.mockReturnValue({ select: vi.fn().mockResolvedValue([{ _id: ids.opportunity }]) });
    Application.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue({ _id: "application" }) });
    Report.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });
    Report.create.mockResolvedValue({ _id: ids.report });
    Report.findById.mockReturnValue(createQuery({ _id: ids.report }));
    const res = createResponse();

    await createReport(organisationRequest(body), res);

    expect(Opportunity.find).toHaveBeenCalledWith({ organisationId: ids.submitter });
    expect(res.status).toHaveBeenCalledWith(201);

    User.findById.mockReturnValue({ select: vi.fn().mockResolvedValue({ _id: ids.submitter, role: "volunteer" }) });
    const selfRes = createResponse();
    await createReport(organisationRequest({ ...body, reportedUserId: ids.submitter }), selfRes);
    expect(selfRes.status).toHaveBeenCalledWith(400);
  });

  it("rejects duplicate open reports while allowing a new report after resolution", async () => {
    const body = {
      reportType: "OpportunityViolation",
      opportunityViolationType: "Others",
      reportedOpportunityId: ids.opportunity,
      title: "Repeated report",
      details: "Details",
    };
    Opportunity.findById.mockReturnValue({ select: vi.fn().mockResolvedValue({ _id: ids.opportunity }) });
    Application.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue({ _id: "application" }) });
    Report.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue({ _id: "existing" }) });
    const duplicateRes = createResponse();
    await createReport(volunteerRequest(body), duplicateRes);
    expect(duplicateRes.status).toHaveBeenCalledWith(409);
    expect(Report.create).not.toHaveBeenCalled();
  });

  it("lists own/admin reports with pagination and returns safe detail/status transitions", async () => {
    const listQuery = createQuery([{ _id: ids.report }]);
    Report.find.mockReturnValue(listQuery);
    Report.countDocuments.mockResolvedValue(1);
    const ownRes = createResponse();
    await getMyReports({ user: { _id: ids.submitter }, query: { page: "2", limit: "5" } }, ownRes);
    expect(Report.find).toHaveBeenCalledWith({ submittedBy: ids.submitter });
    expect(listQuery.skip).toHaveBeenCalledWith(5);
    expect(ownRes.body.pagination).toEqual({ page: 2, limit: 5, totalPages: 1 });

    const allQuery = createQuery([{ _id: ids.report }]);
    Report.find.mockReturnValue(allQuery);
    const allRes = createResponse();
    await getAllReports({ query: {} }, allRes);
    expect(Report.find).toHaveBeenCalledWith();
    expect(allRes.status).toHaveBeenCalledWith(200);

    const report = { _id: ids.report, status: "Pending", save: vi.fn().mockResolvedValue(undefined) };
    Report.findById.mockResolvedValueOnce(report).mockReturnValueOnce(createQuery({ ...report, status: "Investigating" }));
    const updateRes = createResponse();
    await updateReportStatus({ params: { id: ids.report }, body: { status: "Investigating" } }, updateRes);
    expect(report.status).toBe("Investigating");
    expect(report.save).toHaveBeenCalledOnce();
    expect(updateRes.status).toHaveBeenCalledWith(200);
  });

  it("handles invalid/missing/deletion outcomes safely", async () => {
    const invalid = createResponse();
    await getReportById({ params: { id: "invalid" } }, invalid);
    expect(invalid.status).toHaveBeenCalledWith(400);

    Report.findById.mockReturnValue(createQuery(null));
    const missing = createResponse();
    await getReportById({ params: { id: ids.report } }, missing);
    expect(missing.status).toHaveBeenCalledWith(404);

    Report.findById.mockResolvedValue(null);
    const deleteMissing = createResponse();
    await deleteReport({ params: { id: ids.report } }, deleteMissing);
    expect(deleteMissing.status).toHaveBeenCalledWith(404);

    Report.findById.mockResolvedValue({ _id: ids.report });
    Report.findByIdAndDelete.mockResolvedValue({ _id: ids.report });
    const deleteRes = createResponse();
    await deleteReport({ params: { id: ids.report } }, deleteRes);
    expect(Report.findByIdAndDelete).toHaveBeenCalledWith(ids.report);
    expect(deleteRes.status).toHaveBeenCalledWith(200);
  });
});
