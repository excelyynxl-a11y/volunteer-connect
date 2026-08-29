import mongoose from "mongoose";
import { describe, expect, it } from "vitest";

import Opportunity, {
  OPPORTUNITY_CATEGORIES,
  OPPORTUNITY_STATUSES,
} from "../../src/models/opportunity.model.js";

const createValidOpportunity = () => ({
  title: "Beach Cleanup",
  details: "Help clean the beach and remove rubbish.",
  organisationId: new mongoose.Types.ObjectId(),
  location: "Selangor, Petaling Jaya",
  startAt: new Date("2099-07-20T10:00:00.000Z"),
  endAt: new Date("2099-07-20T14:00:00.000Z"),
  applicationDeadline: new Date("2099-07-19T10:00:00.000Z"),
  maxVolunteers: 20,
  category: ["Environment"],
  requirements: "Bring gloves.",
});

describe("opportunity model", () => {
  it("requires title, details, organisation, location, dates, and capacity", () => {
    const error = new Opportunity({}).validateSync();

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.title).toBeDefined();
    expect(error.errors.details).toBeDefined();
    expect(error.errors.organisationId).toBeDefined();
    expect(error.errors.location).toBeDefined();
    expect(error.errors.startAt).toBeDefined();
    expect(error.errors.endAt).toBeDefined();
    expect(error.errors.applicationDeadline).toBeDefined();
    expect(error.errors.maxVolunteers).toBeDefined();
  });

  it("accepts supported categories and statuses", () => {
    for (const category of OPPORTUNITY_CATEGORIES) {
      const opportunity = new Opportunity({ ...createValidOpportunity(), category: [category] });
      expect(opportunity.validateSync()).toBeUndefined();
    }

    for (const status of OPPORTUNITY_STATUSES) {
      const opportunity = new Opportunity({ ...createValidOpportunity(), status });
      expect(opportunity.validateSync()).toBeUndefined();
    }
  });

  it("rejects unsupported category and status values", () => {
    const category = new Opportunity({ ...createValidOpportunity(), category: ["Invalid Category"] });
    const status = new Opportunity({ ...createValidOpportunity(), status: "invalid-status" });

    expect(category.validateSync().errors["category.0"]).toBeDefined();
    expect(status.validateSync().errors.status).toBeDefined();
  });

  it("requires the end time to be after the start time and the deadline before start", () => {
    const invalidEnd = new Opportunity({
      ...createValidOpportunity(),
      endAt: new Date("2099-07-20T09:00:00.000Z"),
    });
    const invalidDeadline = new Opportunity({
      ...createValidOpportunity(),
      applicationDeadline: new Date("2099-07-20T11:00:00.000Z"),
    });

    expect(invalidEnd.validateSync().errors.endAt.message).toBe(
      "End date/time must be after start date/time.",
    );
    expect(invalidDeadline.validateSync().errors.applicationDeadline.message).toBe(
      "Application deadline must be before the opportunity start time.",
    );
  });

  it("prevents approved volunteers from exceeding maximum capacity", () => {
    const opportunity = new Opportunity({
      ...createValidOpportunity(),
      maxVolunteers: 10,
      approvedVolunteersCount: 11,
    });

    expect(opportunity.validateSync().errors.approvedVolunteersCount.message).toBe(
      "Approved volunteers count cannot exceed maximum volunteers.",
    );
  });

  it("calculates remaining spots and full state without negative values", () => {
    const opportunity = new Opportunity({
      ...createValidOpportunity(),
      maxVolunteers: 20,
      approvedVolunteersCount: 5,
    });

    expect(opportunity.spotsRemaining).toBe(15);
    expect(opportunity.isFull).toBe(false);
    opportunity.approvedVolunteersCount = 20;
    expect(opportunity.spotsRemaining).toBe(0);
    expect(opportunity.isFull).toBe(true);
    opportunity.approvedVolunteersCount = 25;
    expect(opportunity.spotsRemaining).toBe(0);
    expect(opportunity.isFull).toBe(true);
  });

  it("does not expose the retired images field", () => {
    expect(Opportunity.schema.path("images")).toBeUndefined();
    const opportunity = new Opportunity({ images: ["https://example.com/image.jpg"] });
    expect(opportunity.toObject()).not.toHaveProperty("images");
  });
});
