import mongoose from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  Opportunity: vi.fn(),
}));

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

  OPPORTUNITY_STATUSES: [
    "active",
    "closed",
    "cancelled",
    "completed",
  ],
}));

import {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getOrganisationOpportunities,
} from "../../src/controllers/opportunity.controller.js";

const createResponse = () => {
  const response = {
    body: null,
    statusCode: null,
  };

  response.status = vi.fn((statusCode) => {
    response.statusCode = statusCode;
    return response;
  });

  response.json = vi.fn((body) => {
    response.body = body;
    return response;
  });

  return response;
};

const createUser = (role = "organisation") => ({
  _id: new mongoose.Types.ObjectId(),
  role,
});

const getFutureDates = () => ({
  startAt: new Date("2099-07-20T10:00:00.000Z"),
  endAt: new Date("2099-07-20T14:00:00.000Z"),
  applicationDeadline: new Date("2099-07-19T10:00:00.000Z"),
});

const createOpportunityBody = () => {
  const {
    startAt,
    endAt,
    applicationDeadline,
  } = getFutureDates();

  return {
    title: "Beach Cleanup",
    details: "Help clean the beach and remove rubbish.",
    maxVolunteers: 20,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    applicationDeadline: applicationDeadline.toISOString(),
    location: "Selangor, Petaling Jaya",
    category: ["Environment"],
    requirements: "Bring gloves.",
    images: ["https://example.com/image.jpg"],
  };
};

const createStoredOpportunity = (organisationId) => {
  const {
    startAt,
    endAt,
    applicationDeadline,
  } = getFutureDates();

  return {
    _id: new mongoose.Types.ObjectId(),
    organisationId,
    title: "Beach Cleanup",
    details: "Help clean the beach.",
    location: "Selangor",
    maxVolunteers: 20,
    approvedVolunteersCount: 5,
    startAt,
    endAt,
    applicationDeadline,
    category: ["Environment"],
    requirements: "Bring gloves.",
    images: [],
    status: "active",
    save: vi.fn().mockResolvedValue(),
  };
};

beforeEach(() => {
  vi.clearAllMocks();

  mocks.Opportunity.mockImplementation(function (data) {
    Object.assign(this, data);
    this.save = vi.fn().mockResolvedValue(this);
  });
});

describe("opportunity controller", () => {
  describe("create", () => {
    it("validates required strings and their maximum lengths", async () => {
      const user = createUser();

      const tests = [
        {
          field: "title",
          value: "",
        },
        {
          field: "details",
          value: "",
        },
        {
          field: "location",
          value: "",
        },
        {
          field: "title",
          value: "a".repeat(121),
        },
        {
          field: "details",
          value: "a".repeat(5001),
        },
        {
          field: "location",
          value: "a".repeat(301),
        },
      ];

      for (const test of tests) {
        const response = createResponse();
        const body = createOpportunityBody();

        body[test.field] = test.value;

        await createOpportunity(
          {
            body,
            user,
          },
          response,
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });

    it("requires a positive integer maximum volunteer count", async () => {
      const user = createUser();

      for (const value of [0, -1, 1.5, "abc"]) {
        const response = createResponse();
        const body = createOpportunityBody();

        body.maxVolunteers = value;

        await createOpportunity(
          {
            body,
            user,
          },
          response,
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(
          "Max volunteers must be a positive integer",
        );
      }
    });

    it("validates date formats and chronological order", async () => {
      const user = createUser();

      // Invalid date format
      const invalidDateResponse = createResponse();
      const invalidDateBody = createOpportunityBody();

      invalidDateBody.startAt = "not-a-date";

      await createOpportunity(
        {
          body: invalidDateBody,
          user,
        },
        invalidDateResponse,
      );

      expect(invalidDateResponse.statusCode).toBe(400);
      expect(invalidDateResponse.body.message).toBe(
        "Invalid opportunity date format",
      );

      // End time before start time
      const endDateResponse = createResponse();
      const endDateBody = createOpportunityBody();

      endDateBody.endAt = "2099-07-20T09:00:00.000Z";

      await createOpportunity(
        {
          body: endDateBody,
          user,
        },
        endDateResponse,
      );

      expect(endDateResponse.statusCode).toBe(400);
      expect(endDateResponse.body.message).toBe(
        "End time must be after start time",
      );

      // Deadline after start time
      const deadlineResponse = createResponse();
      const deadlineBody = createOpportunityBody();

      deadlineBody.applicationDeadline =
        "2099-07-20T11:00:00.000Z";

      await createOpportunity(
        {
          body: deadlineBody,
          user,
        },
        deadlineResponse,
      );

      expect(deadlineResponse.statusCode).toBe(400);
      expect(deadlineResponse.body.message).toBe(
        "Application deadline must be before start time",
      );
    });

    it("rejects a start date before today", async () => {
      const user = createUser();
      const response = createResponse();
      const body = createOpportunityBody();

      body.startAt = "2000-01-01T10:00:00.000Z";
      body.endAt = "2000-01-01T14:00:00.000Z";
      body.applicationDeadline = "1999-12-31T10:00:00.000Z";

      await createOpportunity(
        {
          body,
          user,
        },
        response,
      );

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        "Start date cannot be before today",
      );
    });

    it("validates categories, requirements, and HTTP image URLs", async () => {
      const user = createUser();

      // Category must be an array
      const categoryResponse = createResponse();
      const categoryBody = createOpportunityBody();

      categoryBody.category = "Environment";

      await createOpportunity(
        {
          body: categoryBody,
          user,
        },
        categoryResponse,
      );

      expect(categoryResponse.statusCode).toBe(400);
      expect(categoryResponse.body.message).toBe(
        "Category must be an array",
      );

      // Unsupported category
      const unsupportedCategoryResponse = createResponse();
      const unsupportedCategoryBody = createOpportunityBody();

      unsupportedCategoryBody.category = ["Invalid Category"];

      await createOpportunity(
        {
          body: unsupportedCategoryBody,
          user,
        },
        unsupportedCategoryResponse,
      );

      expect(unsupportedCategoryResponse.statusCode).toBe(400);
      expect(unsupportedCategoryResponse.body.message).toBe(
        "Category contains an unsupported value",
      );

      // Requirements too long
      const requirementsResponse = createResponse();
      const requirementsBody = createOpportunityBody();

      requirementsBody.requirements = "a".repeat(2001);

      await createOpportunity(
        {
          body: requirementsBody,
          user,
        },
        requirementsResponse,
      );

      expect(requirementsResponse.statusCode).toBe(400);
      expect(requirementsResponse.body.message).toBe(
        "Requirements must be a string with at most 2000 characters",
      );

      // Invalid image URL
      const imageResponse = createResponse();
      const imageBody = createOpportunityBody();

      imageBody.images = ["ftp://example.com/image.jpg"];

      await createOpportunity(
        {
          body: imageBody,
          user,
        },
        imageResponse,
      );

      expect(imageResponse.statusCode).toBe(400);
      expect(imageResponse.body.message).toBe(
        "Images must contain valid HTTP or HTTPS URLs",
      );
    });

    it("derives the owning organisation from the authenticated user", async () => {
      const user = createUser();
      const response = createResponse();
      const body = createOpportunityBody();

      await createOpportunity(
        {
          body,
          user,
        },
        response,
      );

      expect(mocks.Opportunity).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Beach Cleanup",
          details: "Help clean the beach and remove rubbish.",
          location: "Selangor, Petaling Jaya",
          maxVolunteers: 20,
          category: ["Environment"],
          requirements: "Bring gloves.",
          images: ["https://example.com/image.jpg"],
          organisationId: user._id,
        }),
      );

      const createdOpportunity =
        mocks.Opportunity.mock.instances[0];

      expect(createdOpportunity.save).toHaveBeenCalled();

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Opportunity created successfully",
      );
    });

    it("maps model validation and database failures to safe responses", async () => {
      const user = createUser();

      // Mongoose validation error
      const validationResponse = createResponse();
      const validationBody = createOpportunityBody();

      const validationError = new Error("Validation failed");
      validationError.name = "ValidationError";

      mocks.Opportunity.mockImplementationOnce(function (data) {
        Object.assign(this, data);
        this.save = vi.fn().mockRejectedValue(validationError);
      });

      await createOpportunity(
        {
          body: validationBody,
          user,
        },
        validationResponse,
      );

      expect(validationResponse.statusCode).toBe(400);
      expect(validationResponse.body.success).toBe(false);
      expect(validationResponse.body.message).toBe(
        "Validation failed",
      );

      // Database error
      const databaseResponse = createResponse();
      const databaseBody = createOpportunityBody();

      mocks.Opportunity.mockImplementationOnce(function (data) {
        Object.assign(this, data);
        this.save = vi.fn().mockRejectedValue(
          new Error("Database failure"),
        );
      });

      await createOpportunity(
        {
          body: databaseBody,
          user,
        },
        databaseResponse,
      );

      expect(databaseResponse.statusCode).toBe(500);
      expect(databaseResponse.body.success).toBe(false);
      expect(databaseResponse.body.message).toBe(
        "Internal Server Error",
      );
    });
  });

  describe("read and update", () => {
    it("returns list, detail, missing, invalid-ID, and database-error outcomes", async () => {
      const opportunities = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: "Beach Cleanup",
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: "Food Drive",
        },
      ];

      // -------------------------
      // Get all opportunities
      // -------------------------

      const sort = vi.fn().mockResolvedValue(opportunities);

      const populate = vi.fn().mockReturnValue({
        sort,
      });

      mocks.Opportunity.find = vi.fn().mockReturnValue({
        populate,
      });

      const listResponse = createResponse();

      await getAllOpportunities({}, listResponse);

      expect(mocks.Opportunity.find).toHaveBeenCalledWith();

      expect(populate).toHaveBeenCalledWith(
        "organisationId",
        "name",
      );

      expect(sort).toHaveBeenCalledWith({
        publishedAt: -1,
      });

      expect(listResponse.statusCode).toBe(200);
      expect(listResponse.body.success).toBe(true);
      expect(listResponse.body.count).toBe(2);
      expect(listResponse.body.data).toEqual(opportunities);

      // -------------------------
      // Database error on list
      // -------------------------

      const databaseError = vi.fn().mockRejectedValue(
        new Error("Database failure"),
      );

      mocks.Opportunity.find = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: databaseError,
        }),
      });

      const listErrorResponse = createResponse();

      await getAllOpportunities({}, listErrorResponse);

      expect(listErrorResponse.statusCode).toBe(500);
      expect(listErrorResponse.body.success).toBe(false);
      expect(listErrorResponse.body.message).toBe(
        "Internal Server Error",
      );

      // -------------------------
      // Get opportunity by ID
      // -------------------------

      const id = new mongoose.Types.ObjectId();

      const opportunity = {
        _id: id,
        title: "Beach Cleanup",
      };

      const detailPopulate = vi.fn().mockResolvedValue(
        opportunity,
      );

      mocks.Opportunity.findById = vi.fn().mockReturnValue({
        populate: detailPopulate,
      });

      const detailResponse = createResponse();

      await getOpportunityById(
        {
          params: {
            id: String(id),
          },
        },
        detailResponse,
      );

      expect(mocks.Opportunity.findById).toHaveBeenCalledWith(
        String(id),
      );

      expect(detailPopulate).toHaveBeenCalledWith(
        "organisationId",
        "name",
      );

      expect(detailResponse.statusCode).toBe(200);
      expect(detailResponse.body.success).toBe(true);
      expect(detailResponse.body.data).toEqual(opportunity);

      // -------------------------
      // Missing opportunity
      // -------------------------

      mocks.Opportunity.findById = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      });

      const missingResponse = createResponse();

      await getOpportunityById(
        {
          params: {
            id: String(id),
          },
        },
        missingResponse,
      );

      expect(missingResponse.statusCode).toBe(404);
      expect(missingResponse.body.message).toBe(
        "Opportunity not found",
      );

      // -------------------------
      // Invalid ID
      // -------------------------

      const invalidResponse = createResponse();

      await getOpportunityById(
        {
          params: {
            id: "invalid-id",
          },
        },
        invalidResponse,
      );

      expect(invalidResponse.statusCode).toBe(400);
      expect(invalidResponse.body.success).toBe(false);
      expect(invalidResponse.body.message).toBe(
        "Invalid opportunity ID",
      );

      // -------------------------
      // Database error
      // -------------------------

      mocks.Opportunity.findById = vi.fn().mockReturnValue({
        populate: vi.fn().mockRejectedValue(
          new Error("Database error"),
        ),
      });

      const errorResponse = createResponse();

      await getOpportunityById(
        {
          params: {
            id: String(id),
          },
        },
        errorResponse,
      );

      expect(errorResponse.statusCode).toBe(500);
      expect(errorResponse.body.message).toBe(
        "Database error",
      );
    });

    it("requires at least one valid update field", async () => {
      const response = createResponse();

      await updateOpportunity(
        {
          params: {
            id: String(new mongoose.Types.ObjectId()),
          },
          body: {},
          user: createUser(),
        },
        response,
      );

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "At least one field must be provided",
      );
    });

    it("allows only the owner or an admin to update an opportunity", async () => {
      const owner = createUser("organisation");
      const otherOrganisation = createUser("organisation");
      const admin = createUser("admin");

      const opportunity = createStoredOpportunity(
        owner._id,
      );

      mocks.Opportunity.findById = vi.fn().mockResolvedValue(
        opportunity,
      );

      // Other organisation should be rejected
      const unauthorizedResponse = createResponse();

      await updateOpportunity(
        {
          params: {
            id: String(opportunity._id),
          },
          body: {
            title: "Unauthorized update",
          },
          user: otherOrganisation,
        },
        unauthorizedResponse,
      );

      expect(unauthorizedResponse.statusCode).toBe(403);

      expect(
        unauthorizedResponse.body.message,
      ).toBe(
        "You are not authorized to update this opportunity",
      );

      expect(opportunity.save).not.toHaveBeenCalled();

      // Admin should be allowed
      const adminResponse = createResponse();

      await updateOpportunity(
        {
          params: {
            id: String(opportunity._id),
          },
          body: {
            title: "Admin update",
          },
          user: admin,
        },
        adminResponse,
      );

      expect(adminResponse.statusCode).toBe(200);
      expect(opportunity.title).toBe("Admin update");
      expect(opportunity.save).toHaveBeenCalled();
    });

    it("prevents capacity from dropping below the approved count", async () => {
      const owner = createUser();

      const opportunity = createStoredOpportunity(
        owner._id,
      );

      opportunity.approvedVolunteersCount = 10;

      mocks.Opportunity.findById = vi.fn().mockResolvedValue(
        opportunity,
      );

      const response = createResponse();

      await updateOpportunity(
        {
          params: {
            id: String(opportunity._id),
          },
          body: {
            maxVolunteers: 5,
          },
          user: owner,
        },
        response,
      );

      expect(response.statusCode).toBe(400);

      expect(response.body.message).toBe(
        "Max volunteers cannot be lower than the approved volunteer count",
      );

      expect(opportunity.save).not.toHaveBeenCalled();
    });

    it("validates the combined existing and updated date values", async () => {
      const owner = createUser();

      const opportunity = createStoredOpportunity(
        owner._id,
      );

      mocks.Opportunity.findById = vi.fn().mockResolvedValue(
        opportunity,
      );

      // New start time after existing end time
      const endResponse = createResponse();

      await updateOpportunity(
        {
          params: {
            id: String(opportunity._id),
          },
          body: {
            startAt: "2099-07-20T15:00:00.000Z",
          },
          user: owner,
        },
        endResponse,
      );

      expect(endResponse.statusCode).toBe(400);

      expect(endResponse.body.message).toBe(
        "End time must be after start time",
      );

      // New deadline after existing start time
      const deadlineResponse = createResponse();

      await updateOpportunity(
        {
          params: {
            id: String(opportunity._id),
          },
          body: {
            applicationDeadline:
              "2099-07-20T11:00:00.000Z",
          },
          user: owner,
        },
        deadlineResponse,
      );

      expect(deadlineResponse.statusCode).toBe(400);

      expect(deadlineResponse.body.message).toBe(
        "Application deadline must be before start time",
      );
    });

    it("saves only supplied fields and preserves other values", async () => {
      const owner = createUser();

      const opportunity = createStoredOpportunity(
        owner._id,
      );

      mocks.Opportunity.findById = vi.fn().mockResolvedValue(
        opportunity,
      );

      const response = createResponse();

      await updateOpportunity(
        {
          params: {
            id: String(opportunity._id),
          },
          body: {
            status: "closed",
            requirements: "  Updated requirements  ",
          },
          user: owner,
        },
        response,
      );

      // Updated fields
      expect(opportunity.status).toBe("closed");

      expect(opportunity.requirements).toBe(
        "Updated requirements",
      );

      // Existing fields preserved
      expect(opportunity.title).toBe("Beach Cleanup");

      expect(opportunity.details).toBe(
        "Help clean the beach.",
      );

      expect(opportunity.location).toBe("Selangor");

      expect(opportunity.maxVolunteers).toBe(20);

      expect(opportunity.category).toEqual([
        "Environment",
      ]);

      expect(opportunity.save).toHaveBeenCalled();

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Opportunity updated successfully",
      );
    });
  });

  describe("delete and own list", () => {
    it("handles invalid, missing, successful, and failed deletion", async () => {
      // -------------------------
      // Invalid ID
      // -------------------------

      const invalidResponse = createResponse();

      await deleteOpportunity(
        {
          params: {
            id: "invalid-id",
          },
        },
        invalidResponse,
      );

      expect(invalidResponse.statusCode).toBe(400);

      expect(invalidResponse.body.message).toBe(
        "Invalid opportunity ID",
      );

      // -------------------------
      // Missing opportunity
      // -------------------------

      const id = new mongoose.Types.ObjectId();

      mocks.Opportunity.findById = vi.fn().mockResolvedValue(
        null,
      );

      const missingResponse = createResponse();

      await deleteOpportunity(
        {
          params: {
            id: String(id),
          },
        },
        missingResponse,
      );

      expect(missingResponse.statusCode).toBe(404);

      expect(missingResponse.body.message).toBe(
        "Opportunity not found",
      );

      // -------------------------
      // Successful deletion
      // -------------------------

      mocks.Opportunity.findById = vi.fn().mockResolvedValue({
        _id: id,
      });

      mocks.Opportunity.findByIdAndDelete =
        vi.fn().mockResolvedValue({
          _id: id,
        });

      const successResponse = createResponse();

      await deleteOpportunity(
        {
          params: {
            id: String(id),
          },
        },
        successResponse,
      );

      expect(
        mocks.Opportunity.findByIdAndDelete,
      ).toHaveBeenCalledWith(String(id));

      expect(successResponse.statusCode).toBe(200);

      expect(successResponse.body.success).toBe(true);

      expect(successResponse.body.message).toBe(
        "Opportunity deleted successfully",
      );

      // -------------------------
      // Database failure
      // -------------------------

      mocks.Opportunity.findById = vi.fn().mockResolvedValue({
        _id: id,
      });

      mocks.Opportunity.findByIdAndDelete =
        vi.fn().mockRejectedValue(
          new Error("Database failure"),
        );

      const failedResponse = createResponse();

      await deleteOpportunity(
        {
          params: {
            id: String(id),
          },
        },
        failedResponse,
      );

      expect(failedResponse.statusCode).toBe(500);

      expect(failedResponse.body.message).toBe(
        "Database failure",
      );
    });

    it("lists only opportunities owned by the authenticated organisation", async () => {
      const organisation = createUser("organisation");

      const opportunities = [
        {
          _id: new mongoose.Types.ObjectId(),
          organisationId: organisation._id,
          title: "Beach Cleanup",
        },
      ];

      mocks.Opportunity.find = vi.fn().mockResolvedValue(
        opportunities,
      );

      const response = createResponse();

      await getOrganisationOpportunities(
        {
          user: organisation,
        },
        response,
      );

      expect(mocks.Opportunity.find).toHaveBeenCalledWith({
        organisationId: organisation._id,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data).toEqual(opportunities);
    });
  });
});