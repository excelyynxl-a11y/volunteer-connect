import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isOpportunityInsideAvailability: vi.fn(),
  sendApplicationStatusEmail: vi.fn(),
}));

vi.mock("../../src/models/application.model.js", () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
    countDocuments: vi.fn(),
  },
}));
vi.mock("../../src/models/opportunity.model.js", () => ({
  default: {
    find: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn(),
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn(),
  },
}));
vi.mock("../../src/lib/availability.js", () => ({
  isOpportunityInsideAvailability: mocks.isOpportunityInsideAvailability,
}));
vi.mock("../../src/lib/email.js", () => ({
  sendApplicationStatusEmail: mocks.sendApplicationStatusEmail,
}));

import Application from "../../src/models/application.model.js";
import {
  approveApplication,
  createApplication,
  deleteApplication,
  getApplicationById,
  getMyApplications,
  getMyOrganisationApplications,
  rejectApplication,
  withdrawApplication,
} from "../../src/controllers/application.controller.js";
import Opportunity from "../../src/models/opportunity.model.js";

const ids = {
  application: "507f191e810c19729de860e1",
  volunteer: "507f191e810c19729de860e2",
  otherVolunteer: "507f191e810c19729de860e3",
  organisation: "507f191e810c19729de860e4",
  otherOrganisation: "507f191e810c19729de860e5",
  opportunity: "507f191e810c19729de860e6",
};

const createResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const createQuery = (value) => {
  const query = {
    populate: vi.fn(),
    select: vi.fn(),
    sort: vi.fn(),
    skip: vi.fn(),
    limit: vi.fn(),
    then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
  };
  for (const method of ["populate", "select", "sort", "skip", "limit"]) {
    query[method].mockReturnValue(query);
  }
  return query;
};

const activeOpportunity = (overrides = {}) => ({
  _id: ids.opportunity,
  organisationId: ids.organisation,
  status: "active",
  applicationDeadline: new Date("2099-01-01T00:00:00.000Z"),
  maxVolunteers: 10,
  approvedVolunteersCount: 2,
  ...overrides,
});

const populatedApplication = (overrides = {}) => ({
  _id: ids.application,
  status: "pending",
  volunteerId: { _id: ids.volunteer, name: "Alex", role: "volunteer" },
  opportunityId: {
    _id: ids.opportunity,
    organisationId: { _id: ids.organisation, name: "Helping Hands", role: "organisation" },
    maxVolunteers: 10,
    approvedVolunteersCount: 2,
    status: "active",
  },
  ...overrides,
});

const volunteerRequest = (body = {}, overrides = {}) => ({
  user: { _id: ids.volunteer, role: "volunteer", availability: [], ...overrides.user },
  body,
  query: {},
  ...overrides,
});

const organisationRequest = (body = {}, overrides = {}) => ({
  user: { _id: ids.organisation, role: "organisation", ...overrides.user },
  body,
  query: {},
  ...overrides,
});

describe("application controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isOpportunityInsideAvailability.mockReturnValue(true);
    mocks.sendApplicationStatusEmail.mockResolvedValue(true);
    Application.countDocuments.mockResolvedValue(0);
    Opportunity.updateOne.mockResolvedValue({ acknowledged: true });
  });

  describe("createApplication", () => {
    it("validates the opportunity, derives volunteer identity, and returns a populated pending application", async () => {
      const opportunity = activeOpportunity();
      const saved = { _id: ids.application };
      const returned = populatedApplication();
      Opportunity.findOne.mockResolvedValue(opportunity);
      Application.findOne.mockResolvedValue(null);
      Application.create.mockResolvedValue(saved);
      Application.findById.mockReturnValue(createQuery(returned));

      const res = createResponse();
      await createApplication(volunteerRequest({
        opportunityId: ids.opportunity,
        volunteerId: ids.otherVolunteer,
      }), res);

      expect(Opportunity.findOne).toHaveBeenCalledWith({ _id: ids.opportunity, deletedAt: null });
      expect(Application.findOne).toHaveBeenCalledWith({
        volunteerId: ids.volunteer,
        opportunityId: ids.opportunity,
      });
      expect(Application.create).toHaveBeenCalledWith({
        volunteerId: ids.volunteer,
        opportunityId: ids.opportunity,
        status: "pending",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: returned,
      }));
    });

    it("rejects invalid, missing, inactive, expired, and full opportunities", async () => {
      const invalidRes = createResponse();
      await createApplication(volunteerRequest({ opportunityId: "invalid" }), invalidRes);
      expect(invalidRes.status).toHaveBeenCalledWith(400);

      const cases = [
        [null, 404],
        [activeOpportunity({ status: "closed" }), 400],
        [activeOpportunity({ applicationDeadline: new Date("2000-01-01") }), 400],
        [activeOpportunity({ approvedVolunteersCount: 10 }), 400],
      ];
      for (const [opportunity, status] of cases) {
        Opportunity.findOne.mockResolvedValueOnce(opportunity);
        const res = createResponse();
        await createApplication(volunteerRequest({ opportunityId: ids.opportunity }), res);
        expect(res.status).toHaveBeenCalledWith(status);
      }
      expect(Application.create).not.toHaveBeenCalled();
    });

    it("enforces volunteer availability and prevents duplicate applications", async () => {
      Opportunity.findOne.mockResolvedValue(activeOpportunity());
      mocks.isOpportunityInsideAvailability.mockReturnValue(false);
      const availabilityRes = createResponse();
      await createApplication(volunteerRequest(
        { opportunityId: ids.opportunity },
        { user: { availability: [{ dayOfWeek: "Monday", startTime: "09:00", endTime: "12:00" }] } },
      ), availabilityRes);
      expect(mocks.isOpportunityInsideAvailability).toHaveBeenCalledOnce();
      expect(availabilityRes.status).toHaveBeenCalledWith(400);

      mocks.isOpportunityInsideAvailability.mockReturnValue(true);
      Application.findOne.mockResolvedValue({ _id: "existing" });
      const duplicateRes = createResponse();
      await createApplication(volunteerRequest({ opportunityId: ids.opportunity }), duplicateRes);
      expect(duplicateRes.status).toHaveBeenCalledWith(409);
      expect(Application.create).not.toHaveBeenCalled();
    });

    it("maps a concurrent duplicate-key collision to a safe conflict response", async () => {
      Opportunity.findOne.mockResolvedValue(activeOpportunity());
      Application.findOne.mockResolvedValue(null);
      Application.create.mockRejectedValue({ code: 11000 });
      const res = createResponse();

      await createApplication(volunteerRequest({ opportunityId: ids.opportunity }), res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "You have already applied for this opportunity",
      }));
    });
  });

  describe("application lists", () => {
    it("validates status filters and paginates the volunteer list", async () => {
      const invalidRes = createResponse();
      await getMyApplications(volunteerRequest({}, { query: { status: "unknown" } }), invalidRes);
      expect(invalidRes.status).toHaveBeenCalledWith(400);

      const query = createQuery([populatedApplication()]);
      Application.find.mockReturnValue(query);
      Application.countDocuments.mockResolvedValue(1);
      const res = createResponse();
      await getMyApplications(volunteerRequest({}, { query: { status: "APPROVED", page: "2", limit: "5" } }), res);

      expect(Application.find).toHaveBeenCalledWith({ volunteerId: ids.volunteer, status: "approved" });
      expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(query.skip).toHaveBeenCalledWith(5);
      expect(query.limit).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        count: 1,
        pagination: { page: 2, limit: 5, totalPages: 1 },
      }));
    });

    it("restricts organisation lists to owned opportunities and validates an opportunity filter", async () => {
      const ownedQuery = createQuery([{ _id: ids.opportunity }]);
      Opportunity.find.mockReturnValue(ownedQuery);
      const applicationQuery = createQuery([populatedApplication()]);
      Application.find.mockReturnValue(applicationQuery);
      Application.countDocuments.mockResolvedValue(1);

      const res = createResponse();
      await getMyOrganisationApplications(organisationRequest({}, {
        query: { status: "pending", opportunityId: ids.opportunity },
      }), res);

      expect(Opportunity.find).toHaveBeenCalledWith({ organisationId: ids.organisation, deletedAt: null });
      expect(applicationQuery.populate).toHaveBeenCalled();
      expect(Application.find).toHaveBeenCalledWith({ opportunityId: ids.opportunity, status: "pending" });
      expect(res.status).toHaveBeenCalledWith(200);

      Opportunity.find.mockReturnValue(createQuery([{ _id: ids.opportunity }]));
      const wrongRes = createResponse();
      await getMyOrganisationApplications(organisationRequest({}, {
        query: { opportunityId: ids.otherOrganisation },
      }), wrongRes);
      expect(wrongRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe("detail and state changes", () => {
    it("returns detail only to the applicant, owning organisation, or admin", async () => {
      const detail = populatedApplication();
      Application.findById.mockReturnValue(createQuery(detail));

      for (const request of [
        volunteerRequest({}, { user: { _id: ids.volunteer, role: "volunteer" } }),
        organisationRequest({}, { user: { _id: ids.organisation, role: "organisation" } }),
        { user: { _id: "admin", role: "admin" } },
      ]) {
        const res = createResponse();
        await getApplicationById({ ...request, params: { id: ids.application } }, res);
        expect(res.status).toHaveBeenCalledWith(200);
      }

      Application.findById.mockReturnValue(createQuery(detail));
      const forbidden = createResponse();
      await getApplicationById({
        user: { _id: ids.otherVolunteer, role: "volunteer" },
        params: { id: ids.application },
      }, forbidden);
      expect(forbidden.status).toHaveBeenCalledWith(403);
    });

    it("allows only the owning organisation to approve or reject a pending application", async () => {
      const base = populatedApplication({
        opportunityId: {
          ...populatedApplication().opportunityId,
          organisationId: ids.organisation,
        },
      });
      Application.findById.mockReturnValue(createQuery(base));
      const wrongOrg = createResponse();
      await approveApplication({ user: { _id: ids.otherOrganisation }, params: { id: ids.application } }, wrongOrg);
      expect(wrongOrg.status).toHaveBeenCalledWith(403);

      Application.findById.mockReturnValue(createQuery(base));
      Opportunity.findOneAndUpdate.mockResolvedValue({ ...base.opportunityId, approvedVolunteersCount: 3 });
      Application.findOneAndUpdate.mockReturnValue(createQuery({ ...base, status: "approved" }));
      Application.findById.mockReturnValueOnce(createQuery(base)).mockReturnValueOnce(createQuery({ ...base, status: "approved" }));
      const approveRes = createResponse();
      await approveApplication({ user: { _id: ids.organisation }, params: { id: ids.application } }, approveRes);
      expect(Opportunity.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ approvedVolunteersCount: { $lt: 10 } }),
        { $inc: { approvedVolunteersCount: 1 } },
        { new: true },
      );
      expect(Application.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: ids.application, status: "pending" },
        { $set: { status: "approved" } },
        { new: true, runValidators: true },
      );
      expect(approveRes.status).toHaveBeenCalledWith(200);

      const rejectedBase = populatedApplication({
        opportunityId: {
          ...populatedApplication().opportunityId,
          organisationId: ids.organisation,
        },
      });
      Application.findById.mockReturnValue(createQuery(rejectedBase));
      Application.findOneAndUpdate.mockReturnValue(createQuery({ ...rejectedBase, status: "rejected" }));
      const rejectRes = createResponse();
      await rejectApplication({
        user: { _id: ids.organisation },
        params: { id: ids.application },
        body: { reason: "Not a fit" },
      }, rejectRes);
      expect(Application.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: ids.application, status: "pending" },
        { $set: { status: "rejected", rejectionReason: "Not a fit" } },
        { new: true, runValidators: true },
      );
      expect(rejectRes.status).toHaveBeenCalledWith(200);
    });

    it("reserves capacity conditionally and releases it during an approved withdrawal", async () => {
      const approved = populatedApplication({
        status: "approved",
        volunteerId: ids.volunteer,
        opportunityId: ids.opportunity,
      });
      Application.findById.mockReturnValueOnce(createQuery(approved)).mockReturnValueOnce(createQuery({ ...approved, status: "withdrawn" }));
      Opportunity.findOneAndUpdate.mockResolvedValue({ approvedVolunteersCount: 1 });
      Application.findOneAndUpdate.mockResolvedValue({ ...approved, status: "withdrawn" });
      const res = createResponse();
      await withdrawApplication({
        user: { _id: ids.volunteer },
        params: { id: ids.application },
        body: { withdrawalReason: "  Schedule conflict " },
      }, res);
      expect(Opportunity.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: approved.opportunityId, approvedVolunteersCount: { $gt: 0 } },
        { $inc: { approvedVolunteersCount: -1 } },
        { new: true },
      );
      expect(Application.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: ids.application, volunteerId: ids.volunteer, status: "approved" },
        { $set: { status: "withdrawn", withdrawalReason: "Schedule conflict" } },
        { new: true, runValidators: true },
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("allows an admin to delete an approved application while keeping capacity consistent", async () => {
      const approved = { ...populatedApplication({ status: "approved" }), opportunityId: ids.opportunity };
      Application.findById.mockResolvedValue(approved);
      Opportunity.findOneAndUpdate.mockResolvedValue({ approvedVolunteersCount: 1 });
      Application.findOneAndDelete.mockResolvedValue(approved);
      const res = createResponse();
      await deleteApplication({ params: { id: ids.application } }, res);

      expect(Opportunity.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: ids.opportunity, approvedVolunteersCount: { $gt: 0 } },
        { $inc: { approvedVolunteersCount: -1 } },
        { new: true },
      );
      expect(Application.findOneAndDelete).toHaveBeenCalledWith({
        _id: ids.application,
        status: "approved",
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
