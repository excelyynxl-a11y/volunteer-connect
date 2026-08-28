import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createApplication,
  getMyApplications,
  getMyOrganisationApplications,
  withdrawApplication,
} from "../../src/controllers/application.controller.js";
import { isOpportunityInsideAvailability } from "../../src/lib/availability.js";
import Application from "../../src/models/application.model.js";
import Opportunity from "../../src/models/opportunity.model.js";

vi.mock("../../src/models/application.model.js", () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
  },
}));
vi.mock("../../src/models/opportunity.model.js", () => ({
  default: { find: vi.fn(), findById: vi.fn() },
}));
vi.mock("../../src/lib/availability.js", () => ({
  isOpportunityInsideAvailability: vi.fn(),
}));

const ids = {
  application: "507f1f77bcf86cd799439011",
  volunteer: "507f191e810c19729de860ea",
  organisation: "507f191e810c19729de860eb",
  opportunity: "507f191e810c19729de860ec",
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
    sort: vi.fn(),
    then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
  };
  query.populate.mockReturnValue(query);
  query.sort.mockResolvedValue(value);
  return query;
};

const activeOpportunity = (overrides = {}) => ({
  _id: ids.opportunity,
  status: "active",
  applicationDeadline: new Date("2099-01-01T00:00:00.000Z"),
  maxVolunteers: 10,
  currentVolunteers: 2,
  ...overrides,
});

describe("application controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isOpportunityInsideAvailability.mockReturnValue(true);
  });

  describe("create", () => {
    it("derives the volunteer from authentication and validates the opportunity ID", async () => {
      const invalidRes = createResponse();
      await createApplication({
        body: { opportunityId: "invalid" },
        user: { _id: ids.volunteer },
      }, invalidRes);
      expect(invalidRes.status).toHaveBeenCalledWith(400);

      Opportunity.findById.mockResolvedValue(activeOpportunity());
      Application.findOne.mockResolvedValue(null);
      Application.create.mockResolvedValue({ _id: ids.application });
      Application.findById.mockReturnValue(createQuery({ _id: ids.application }));
      await createApplication({
        body: { opportunityId: ids.opportunity, volunteerId: "spoofed" },
        user: { _id: ids.volunteer },
      }, createResponse());
      expect(Application.create).toHaveBeenCalledWith({
        volunteerId: ids.volunteer,
        opportunityId: ids.opportunity,
        status: "pending",
      });
    });

    it("rejects missing, non-active, deadline-passed, and full opportunities", async () => {
      const cases = [
        [null, 404],
        [activeOpportunity({ status: "closed" }), 400],
        [activeOpportunity({ applicationDeadline: new Date("2000-01-01") }), 400],
        [activeOpportunity({ currentVolunteers: 10 }), 400],
      ];
      for (const [opportunity, status] of cases) {
        Opportunity.findById.mockResolvedValueOnce(opportunity);
        const res = createResponse();
        await createApplication({
          body: { opportunityId: ids.opportunity },
          user: { _id: ids.volunteer },
        }, res);
        expect(res.status).toHaveBeenCalledWith(status);
      }
      expect(Application.create).not.toHaveBeenCalled();
    });

    it("rejects an opportunity outside the volunteer availability", async () => {
      const availability = [{ dayOfWeek: "Monday", startTime: "09:00", endTime: "12:00" }];
      const opportunity = activeOpportunity();
      Opportunity.findById.mockResolvedValue(opportunity);
      isOpportunityInsideAvailability.mockReturnValue(false);
      const res = createResponse();

      await createApplication({
        body: { opportunityId: ids.opportunity },
        user: { _id: ids.volunteer, availability },
      }, res);

      expect(isOpportunityInsideAvailability).toHaveBeenCalledWith(opportunity, availability);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(Application.findOne).not.toHaveBeenCalled();
    });

    it("rejects an existing application", async () => {
      Opportunity.findById.mockResolvedValue(activeOpportunity());
      Application.findOne.mockResolvedValue({ _id: ids.application });
      const res = createResponse();
      await createApplication({
        body: { opportunityId: ids.opportunity },
        user: { _id: ids.volunteer, availability: [] },
      }, res);
      expect(Application.findOne).toHaveBeenCalledWith({
        volunteerId: ids.volunteer,
        opportunityId: ids.opportunity,
      });
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it.todo("maps a concurrent duplicate-key collision to a safe duplicate response");

    it("creates a pending application and returns populated safe data", async () => {
      const populated = {
        _id: ids.application,
        volunteerId: { _id: ids.volunteer },
        opportunityId: { _id: ids.opportunity, organisationId: { _id: ids.organisation } },
      };
      Opportunity.findById.mockResolvedValue(activeOpportunity());
      Application.findOne.mockResolvedValue(null);
      Application.create.mockResolvedValue({ _id: ids.application });
      const query = createQuery(populated);
      Application.findById.mockReturnValue(query);
      const res = createResponse();

      await createApplication({
        body: { opportunityId: ids.opportunity },
        user: { _id: ids.volunteer, availability: [] },
      }, res);

      expect(query.populate).toHaveBeenCalledWith("volunteerId", "-password");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: populated }));
    });
  });

  describe("authorised reads", () => {
    it("lists only the authenticated volunteer applications with a valid status filter", async () => {
      const applications = [{ _id: ids.application, status: "approved" }];
      const query = createQuery(applications);
      Application.find.mockReturnValue(query);
      const res = createResponse();

      await getMyApplications({
        user: { _id: ids.volunteer },
        query: { status: "APPROVED" },
      }, res);

      expect(Application.find).toHaveBeenCalledWith({
        volunteerId: ids.volunteer,
        status: "approved",
      });
      expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ count: 1 }));
    });

    it("lists applications only from opportunities owned by the organisation", async () => {
      Opportunity.find.mockReturnValue({
        select: vi.fn().mockResolvedValue([{ _id: ids.opportunity }]),
      });
      const query = createQuery([{ _id: ids.application }]);
      Application.find.mockReturnValue(query);

      await getMyOrganisationApplications({
        user: { _id: ids.organisation },
        query: {},
      }, createResponse());

      expect(Opportunity.find).toHaveBeenCalledWith({ organisationId: ids.organisation });
      expect(Application.find).toHaveBeenCalledWith({
        opportunityId: { $in: [ids.opportunity] },
      });
    });

    it("rejects an invalid opportunity filter", async () => {
      Opportunity.find.mockReturnValue({ select: vi.fn().mockResolvedValue([]) });
      const res = createResponse();
      await getMyOrganisationApplications({
        user: { _id: ids.organisation },
        query: { opportunityId: "invalid" },
      }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it.todo("rejects unsupported application status filters");
    it.todo("verifies a supplied opportunity filter belongs to the authenticated organisation");
    it.todo("returns detail only to the applicant, owning organisation, or admin");
  });

  describe("state changes", () => {
    it.todo("allows only the owning organisation to approve or reject a pending application");
    it.todo("prevents repeated or forbidden approval and rejection transitions");
    it.todo("reserves the final available place atomically during approval");

    it("allows only the applicant to withdraw an allowed state", async () => {
      const foreign = {
        volunteerId: "another-volunteer",
        status: "pending",
      };
      Application.findById.mockResolvedValueOnce(foreign);
      const foreignRes = createResponse();
      await withdrawApplication({
        params: { id: ids.application },
        body: {},
        user: { _id: ids.volunteer },
      }, foreignRes);
      expect(foreignRes.status).toHaveBeenCalledWith(403);

      const application = {
        volunteerId: ids.volunteer,
        status: "pending",
        save: vi.fn().mockResolvedValue(undefined),
      };
      Application.findById
        .mockResolvedValueOnce(application)
        .mockReturnValueOnce(createQuery({ _id: ids.application, status: "withdrawn" }));
      const res = createResponse();
      await withdrawApplication({
        params: { id: ids.application },
        body: { withdrawalReason: "Schedule conflict" },
        user: { _id: ids.volunteer },
      }, res);
      expect(application).toMatchObject({
        status: "withdrawn",
        withdrawalReason: "Schedule conflict",
      });
      expect(application.save).toHaveBeenCalledOnce();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it.todo("releases approved capacity atomically during withdrawal");
    it.todo("allows only an admin to delete and keeps approved capacity consistent");
  });
});
