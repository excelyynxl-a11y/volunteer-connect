import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createReport,
  deleteReport,
  getAllReports,
  getMyReports,
  getReportById,
  updateReportStatus,
} from "../../src/controllers/report.controller.js";
import Opportunity from "../../src/models/opportunity.model.js";
import Report from "../../src/models/report.model.js";
import { User } from "../../src/models/user.model.js";

vi.mock("../../src/models/report.model.js", () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));
vi.mock("../../src/models/opportunity.model.js", () => ({
  default: { findById: vi.fn() },
}));
vi.mock("../../src/models/user.model.js", () => ({
  User: { findById: vi.fn() },
}));

const ids = {
  report: "507f1f77bcf86cd799439011",
  submitter: "507f191e810c19729de860ea",
  user: "507f191e810c19729de860eb",
  opportunity: "507f191e810c19729de860ec",
};

const createResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const createQuery = (result) => {
  const query = {
    populate: vi.fn(),
    sort: vi.fn(),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  query.populate.mockReturnValue(query);
  query.sort.mockResolvedValue(result);
  return query;
};

const selectResult = (result) => ({ select: vi.fn().mockResolvedValue(result) });
const volunteerRequest = (body = {}) => ({
  user: { _id: ids.submitter, role: "volunteer" },
  body,
});
const organisationRequest = (body = {}) => ({
  user: { _id: ids.submitter, role: "organisation" },
  body,
});

describe("report controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("validates report type, title, and details", async () => {
      for (const body of [
        { reportType: "Unknown", title: "Title", details: "Details" },
        { reportType: "OpportunityViolation", title: "  ", details: "Details" },
        { reportType: "OpportunityViolation", title: "Title", details: "" },
      ]) {
        const res = createResponse();
        await createReport(volunteerRequest(body), res);
        expect(res.status).toHaveBeenCalledWith(400);
      }
      expect(Report.create).not.toHaveBeenCalled();
    });

    it("allows a volunteer to report only an existing opportunity", async () => {
      const body = {
        reportType: "OpportunityViolation",
        opportunityViolationType: "Hazardous Environment",
        reportedOpportunityId: ids.opportunity,
        title: "Unsafe site",
        details: "Protective equipment was unavailable.",
      };
      Opportunity.findById.mockReturnValue(selectResult(null));
      const missingRes = createResponse();
      await createReport(volunteerRequest(body), missingRes);
      expect(missingRes.status).toHaveBeenCalledWith(404);

      const wrongTypeRes = createResponse();
      await createReport(volunteerRequest({ ...body, reportType: "UserViolation" }), wrongTypeRes);
      expect(wrongTypeRes.status).toHaveBeenCalledWith(403);
      expect(Report.create).not.toHaveBeenCalled();
    });

    it("allows an organisation to report only an existing user", async () => {
      const body = {
        reportType: "UserViolation",
        userViolationType: "Not Punctual",
        reportedUserId: ids.user,
        title: "Late arrival",
        details: "The volunteer arrived after the shift ended.",
      };
      User.findById.mockReturnValue(selectResult(null));
      const missingRes = createResponse();
      await createReport(organisationRequest(body), missingRes);
      expect(missingRes.status).toHaveBeenCalledWith(404);

      const wrongTypeRes = createResponse();
      await createReport(
        organisationRequest({ ...body, reportType: "OpportunityViolation" }),
        wrongTypeRes,
      );
      expect(wrongTypeRes.status).toHaveBeenCalledWith(403);
      expect(Report.create).not.toHaveBeenCalled();
    });

    it("prevents an admin or unsupported role from submitting a report", async () => {
      for (const role of ["admin", "guest"]) {
        const res = createResponse();
        await createReport({
          user: { _id: ids.submitter, role },
          body: {
            reportType: "OpportunityViolation",
            title: "Title",
            details: "Details",
          },
        }, res);
        expect(res.status).toHaveBeenCalledWith(403);
      }
      expect(Report.create).not.toHaveBeenCalled();
    });

    it("validates the matching violation subtype and target ID", async () => {
      const base = {
        reportType: "OpportunityViolation",
        reportedOpportunityId: "invalid",
        title: "Title",
        details: "Details",
      };
      const missingSubtypeRes = createResponse();
      await createReport(volunteerRequest(base), missingSubtypeRes);
      expect(missingSubtypeRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Opportunity violation type is required.",
      }));

      const invalidTargetRes = createResponse();
      await createReport(volunteerRequest({
        ...base,
        opportunityViolationType: "Hazardous Environment",
      }), invalidTargetRes);
      expect(invalidTargetRes.status).toHaveBeenCalledWith(400);

      const organisationRes = createResponse();
      await createReport(organisationRequest({
        reportType: "UserViolation",
        reportedUserId: "invalid",
        title: "Title",
        details: "Details",
      }), organisationRes);
      expect(organisationRes.status).toHaveBeenCalledWith(400);
    });

    it("creates and returns a populated report using the authenticated submitter", async () => {
      const body = {
        reportType: "OpportunityViolation",
        opportunityViolationType: "Hazardous Environment",
        reportedOpportunityId: ids.opportunity,
        title: "  Unsafe site  ",
        details: "  Protective equipment was unavailable.  ",
      };
      const populated = { _id: ids.report, submittedBy: { _id: ids.submitter } };
      Opportunity.findById.mockReturnValue(selectResult({ _id: ids.opportunity }));
      Report.create.mockResolvedValue({ _id: ids.report });
      Report.findById.mockReturnValue(createQuery(populated));
      const res = createResponse();

      await createReport(volunteerRequest(body), res);

      expect(Report.create).toHaveBeenCalledWith({
        submittedBy: ids.submitter,
        reportType: "OpportunityViolation",
        title: "Unsafe site",
        details: "Protective equipment was unavailable.",
        opportunityViolationType: "Hazardous Environment",
        reportedOpportunityId: ids.opportunity,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: populated,
      }));
    });
  });

  describe("read, update, and delete", () => {
    it("lists only reports submitted by the authenticated user", async () => {
      const reports = [{ _id: ids.report }];
      const query = createQuery(reports);
      Report.find.mockReturnValue(query);
      const res = createResponse();
      await getMyReports({ user: { _id: ids.submitter } }, res);
      expect(Report.find).toHaveBeenCalledWith({ submittedBy: ids.submitter });
      expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith({ count: 1, reports });
    });

    it("returns all reports in newest-first order for an admin", async () => {
      const reports = [{ _id: ids.report }];
      const query = createQuery(reports);
      Report.find.mockReturnValue(query);
      const res = createResponse();
      await getAllReports({}, res);
      expect(Report.find).toHaveBeenCalledWith();
      expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("validates report IDs and missing-report outcomes", async () => {
      const invalidRes = createResponse();
      await getReportById({ params: { id: "invalid" } }, invalidRes);
      expect(invalidRes.status).toHaveBeenCalledWith(400);

      Report.findById.mockReturnValue(createQuery(null));
      const missingRes = createResponse();
      await getReportById({ params: { id: ids.report } }, missingRes);
      expect(missingRes.status).toHaveBeenCalledWith(404);
    });

    it("accepts only the supported report status values", async () => {
      for (const status of [undefined, "pending", "Closed", 123]) {
        const res = createResponse();
        await updateReportStatus({ params: { id: ids.report }, body: { status } }, res);
        expect(res.status).toHaveBeenCalledWith(400);
      }
      expect(Report.findById).not.toHaveBeenCalled();
    });

    it("returns the populated report after a status update", async () => {
      const report = { status: "Pending", save: vi.fn().mockResolvedValue(undefined) };
      const populated = { _id: ids.report, status: "Resolved" };
      Report.findById.mockResolvedValueOnce(report).mockReturnValueOnce(createQuery(populated));
      const res = createResponse();
      await updateReportStatus({
        params: { id: ids.report },
        body: { status: "Resolved" },
      }, res);
      expect(report.status).toBe("Resolved");
      expect(report.save).toHaveBeenCalledOnce();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: populated }));
    });

    it("deletes an existing report and handles query failures safely", async () => {
      Report.findById.mockResolvedValue({ _id: ids.report });
      Report.findByIdAndDelete.mockResolvedValue({ _id: ids.report });
      const successRes = createResponse();
      await deleteReport({ params: { id: ids.report } }, successRes);
      expect(Report.findByIdAndDelete).toHaveBeenCalledWith(ids.report);
      expect(successRes.status).toHaveBeenCalledWith(200);

      Report.findById.mockRejectedValueOnce(new Error("database unavailable"));
      const errorRes = createResponse();
      await deleteReport({ params: { id: ids.report } }, errorRes);
      expect(errorRes.status).toHaveBeenCalledWith(500);
      expect(errorRes.json).toHaveBeenCalledWith({ message: "database unavailable" });
    });
  });
});
