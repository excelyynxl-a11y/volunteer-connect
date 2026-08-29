import mongoose from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const Opportunity = vi.fn();
  Opportunity.find = vi.fn();
  Opportunity.findOne = vi.fn();
  Opportunity.countDocuments = vi.fn();
  return {
    Opportunity,
    notifyFollowersOfNewOpportunity: vi.fn(),
  };
});

vi.mock("../../src/models/opportunity.model.js", () => ({
  default: mocks.Opportunity,
  OPPORTUNITY_CATEGORIES: [
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
  ],
  OPPORTUNITY_STATUSES: ["active", "closed", "cancelled", "completed"],
}));
vi.mock("../../src/lib/email.js", () => ({
  notifyFollowersOfNewOpportunity: mocks.notifyFollowersOfNewOpportunity,
}));

import {
  createOpportunity,
  deleteOpportunity,
  getAllOpportunities,
  getOpportunityById,
  getOrganisationOpportunities,
  updateOpportunity,
} from "../../src/controllers/opportunity.controller.js";

const organisationId = new mongoose.Types.ObjectId();
const otherOrganisationId = new mongoose.Types.ObjectId();
const opportunityId = new mongoose.Types.ObjectId();

const createResponse = () => {
  const response = { body: null, statusCode: null };
  response.status = vi.fn((code) => {
    response.statusCode = code;
    return response;
  });
  response.json = vi.fn((body) => {
    response.body = body;
    return response;
  });
  return response;
};

const createQuery = (value) => {
  const query = {
    select: vi.fn(),
    skip: vi.fn(),
    limit: vi.fn(),
    populate: vi.fn(),
    sort: vi.fn(),
    then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
  };
  for (const method of ["select", "skip", "limit", "populate", "sort"]) {
    query[method].mockReturnValue(query);
  }
  return query;
};

const futureDates = () => ({
  startAt: new Date("2099-07-20T10:00:00.000Z"),
  endAt: new Date("2099-07-20T14:00:00.000Z"),
  applicationDeadline: new Date("2099-07-19T10:00:00.000Z"),
});

const createBody = (overrides = {}) => {
  const dates = futureDates();
  return {
    title: "Beach Cleanup",
    details: "Help clean the beach and remove rubbish.",
    maxVolunteers: 20,
    startAt: dates.startAt.toISOString(),
    endAt: dates.endAt.toISOString(),
    applicationDeadline: dates.applicationDeadline.toISOString(),
    location: "Selangor, Petaling Jaya",
    category: ["Environment"],
    requirements: "Bring gloves.",
    ...overrides,
  };
};

const createStoredOpportunity = (overrides = {}) => ({
  _id: opportunityId,
  organisationId,
  title: "Beach Cleanup",
  details: "Help clean the beach.",
  location: "Selangor",
  maxVolunteers: 20,
  approvedVolunteersCount: 5,
  ...futureDates(),
  category: ["Environment"],
  requirements: "Bring gloves.",
  status: "active",
  deletedAt: null,
  save: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("opportunity controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.Opportunity.mockImplementation(function MockOpportunity(data) {
      return createStoredOpportunity(data);
    });
    mocks.notifyFollowersOfNewOpportunity.mockResolvedValue(undefined);
    mocks.Opportunity.countDocuments.mockResolvedValue(0);
  });

  describe("createOpportunity", () => {
    it("validates required fields, dates, category, and capacity", async () => {
      const invalidBodies = [
        { title: "" },
        { details: "" },
        { location: "" },
        { maxVolunteers: 0 },
        { startAt: "not-a-date" },
        { endAt: "2099-07-20T09:00:00.000Z" },
        { applicationDeadline: "2099-07-20T11:00:00.000Z" },
        { category: "Environment" },
        { category: ["Unknown"] },
        { requirements: "r".repeat(2001) },
      ];

      for (const overrides of invalidBodies) {
        const res = createResponse();
        await createOpportunity({ body: createBody(overrides), user: { _id: organisationId } }, res);
        expect(res.statusCode).toBe(400);
      }
      expect(mocks.Opportunity).not.toHaveBeenCalled();
    });

    it("creates an opportunity owned by the authenticated organisation and notifies followers", async () => {
      const res = createResponse();
      await createOpportunity({ body: createBody({ images: ["legacy.jpg"] }), user: { _id: organisationId } }, res);

      expect(mocks.Opportunity).toHaveBeenCalledWith(expect.objectContaining({
        title: "Beach Cleanup",
        organisationId,
        maxVolunteers: 20,
        category: ["Environment"],
      }));
      const opportunity = mocks.Opportunity.mock.results[0].value;
      expect(opportunity.save).toHaveBeenCalledOnce();
      expect(mocks.notifyFollowersOfNewOpportunity).toHaveBeenCalledWith(opportunity, { _id: organisationId });
      expect(res.statusCode).toBe(201);
    });

    it("maps model validation and persistence failures to safe responses", async () => {
      mocks.Opportunity.mockImplementationOnce(function MockOpportunity() {
        return {
        save: vi.fn().mockRejectedValue(Object.assign(new Error("Validation failed"), { name: "ValidationError" })),
        };
      });
      const validationRes = createResponse();
      await createOpportunity({ body: createBody(), user: { _id: organisationId } }, validationRes);
      expect(validationRes.statusCode).toBe(400);

      mocks.Opportunity.mockImplementationOnce(function MockOpportunity() {
        return {
        save: vi.fn().mockRejectedValue(new Error("database unavailable")),
        };
      });
      const databaseRes = createResponse();
      await createOpportunity({ body: createBody(), user: { _id: organisationId } }, databaseRes);
      expect(databaseRes.statusCode).toBe(500);
      expect(databaseRes.body.message).toBe("Internal Server Error");
    });
  });

  describe("read endpoints", () => {
    it("lists non-deleted opportunities with pagination", async () => {
      const query = createQuery([{ _id: opportunityId }]);
      mocks.Opportunity.find.mockReturnValue(query);
      mocks.Opportunity.countDocuments.mockResolvedValue(6);
      const res = createResponse();

      await getAllOpportunities({ query: { page: "2", limit: "5" } }, res);

      expect(mocks.Opportunity.find).toHaveBeenCalledWith({ deletedAt: null });
      expect(query.skip).toHaveBeenCalledWith(5);
      expect(query.limit).toHaveBeenCalledWith(5);
      expect(query.populate).toHaveBeenCalledWith("organisationId", "name");
      expect(res.body.pagination).toEqual({ page: 2, limit: 5, totalPages: 2 });
    });

    it("returns a valid opportunity, a not-found response, and rejects invalid IDs", async () => {
      const invalidRes = createResponse();
      await getOpportunityById({ params: { id: "invalid" } }, invalidRes);
      expect(invalidRes.statusCode).toBe(400);

      mocks.Opportunity.findOne.mockReturnValue(createQuery(null));
      const missingRes = createResponse();
      await getOpportunityById({ params: { id: opportunityId.toString() } }, missingRes);
      expect(missingRes.statusCode).toBe(404);

      const stored = createStoredOpportunity();
      const query = createQuery(stored);
      mocks.Opportunity.findOne.mockReturnValue(query);
      const okRes = createResponse();
      await getOpportunityById({ params: { id: opportunityId.toString() } }, okRes);
      expect(mocks.Opportunity.findOne).toHaveBeenCalledWith({ _id: opportunityId.toString(), deletedAt: null });
      expect(okRes.statusCode).toBe(200);
      expect(okRes.body.data).toBe(stored);
    });
  });

  describe("update and delete", () => {
    it("allows only the owner or an admin to update and preserves omitted fields", async () => {
      const opportunity = createStoredOpportunity();
      mocks.Opportunity.findOne.mockResolvedValue(opportunity);
      const forbiddenRes = createResponse();
      await updateOpportunity({
        params: { id: opportunityId.toString() },
        body: { title: "New title" },
        user: { _id: otherOrganisationId, role: "organisation" },
      }, forbiddenRes);
      expect(forbiddenRes.statusCode).toBe(403);

      mocks.Opportunity.findOne.mockResolvedValue(opportunity);
      const ownerRes = createResponse();
      await updateOpportunity({
        params: { id: opportunityId.toString() },
        body: { title: "  New title ", requirements: "Updated requirements", status: "closed" },
        user: { _id: organisationId, role: "organisation" },
      }, ownerRes);
      expect(opportunity.title).toBe("New title");
      expect(opportunity.requirements).toBe("Updated requirements");
      expect(opportunity.status).toBe("closed");
      expect(opportunity.location).toBe("Selangor");
      expect(ownerRes.statusCode).toBe(200);
    });

    it("rejects unsafe capacity, status, and date changes", async () => {
      const opportunity = createStoredOpportunity({ status: "active" });
      const request = (body) => ({
        params: { id: opportunityId.toString() },
        body,
        user: { _id: organisationId, role: "organisation" },
      });

      mocks.Opportunity.findOne.mockResolvedValue(opportunity);
      const capacityRes = createResponse();
      await updateOpportunity(request({ maxVolunteers: 4 }), capacityRes);
      expect(capacityRes.statusCode).toBe(400);

      mocks.Opportunity.findOne.mockResolvedValue(opportunity);
      const dateRes = createResponse();
      await updateOpportunity(request({ endAt: "2099-07-20T09:00:00.000Z" }), dateRes);
      expect(dateRes.statusCode).toBe(400);

      const completed = createStoredOpportunity({ status: "completed" });
      mocks.Opportunity.findOne.mockResolvedValue(completed);
      const reopenRes = createResponse();
      await updateOpportunity(request({ status: "active" }), reopenRes);
      expect(reopenRes.statusCode).toBe(400);
    });

    it("soft-deletes an opportunity and excludes missing records", async () => {
      const invalidRes = createResponse();
      await deleteOpportunity({ params: { id: "invalid" } }, invalidRes);
      expect(invalidRes.statusCode).toBe(400);

      mocks.Opportunity.findOne.mockResolvedValueOnce(null);
      const missingRes = createResponse();
      await deleteOpportunity({ params: { id: opportunityId.toString() } }, missingRes);
      expect(missingRes.statusCode).toBe(404);

      const opportunity = createStoredOpportunity();
      mocks.Opportunity.findOne.mockResolvedValueOnce(opportunity);
      const okRes = createResponse();
      await deleteOpportunity({ params: { id: opportunityId.toString() } }, okRes);
      expect(opportunity.status).toBe("cancelled");
      expect(opportunity.deletedAt).toBeInstanceOf(Date);
      expect(opportunity.save).toHaveBeenCalledOnce();
      expect(okRes.statusCode).toBe(200);
    });

    it("lists only the authenticated organisation's opportunities", async () => {
      const query = createQuery([createStoredOpportunity()]);
      mocks.Opportunity.find.mockReturnValue(query);
      mocks.Opportunity.countDocuments.mockResolvedValue(1);
      const res = createResponse();

      await getOrganisationOpportunities({ user: { _id: organisationId }, query: {} }, res);

      expect(mocks.Opportunity.find).toHaveBeenCalledWith({ organisationId, deletedAt: null });
      expect(res.statusCode).toBe(200);
    });
  });
});
