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
  images: ["https://example.com/image.jpg"],
});

describe("opportunity model", () => {
  it("requires title, details, organisation, location, dates, and capacity", async () => {
    const opportunity = new Opportunity({});

    const error = await opportunity.validate().catch((err) => err);

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

  it("accepts a valid opportunity", async () => {
    const opportunity = new Opportunity(createValidOpportunity());

    await expect(opportunity.validate()).resolves.toBeUndefined();
  });

  it("rejects unsupported category and status values", async () => {
    const categoryData = createValidOpportunity();
    categoryData.category = ["Invalid Category"];

    const categoryOpportunity = new Opportunity(categoryData);

    const categoryError = await categoryOpportunity
      .validate()
      .catch((err) => err);

    expect(categoryError).toBeInstanceOf(
      mongoose.Error.ValidationError,
    );
    expect(categoryError.errors["category.0"]).toBeDefined();

    const statusData = createValidOpportunity();
    statusData.status = "invalid-status";

    const statusOpportunity = new Opportunity(statusData);

    const statusError = await statusOpportunity
      .validate()
      .catch((err) => err);

    expect(statusError).toBeInstanceOf(
      mongoose.Error.ValidationError,
    );
    expect(statusError.errors.status).toBeDefined();
  });

  it("accepts all supported category and status values", async () => {
    for (const category of OPPORTUNITY_CATEGORIES) {
      const data = createValidOpportunity();
      data.category = [category];

      const opportunity = new Opportunity(data);

      await expect(opportunity.validate()).resolves.toBeUndefined();
    }

    for (const status of OPPORTUNITY_STATUSES) {
      const data = createValidOpportunity();
      data.status = status;

      const opportunity = new Opportunity(data);

      await expect(opportunity.validate()).resolves.toBeUndefined();
    }
  });

  it("requires the end time to be after the start time", async () => {
    const data = createValidOpportunity();

    data.endAt = new Date("2099-07-20T09:00:00.000Z");

    const opportunity = new Opportunity(data);

    const error = await opportunity.validate().catch((err) => err);

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.endAt).toBeDefined();
    expect(error.errors.endAt.message).toBe(
      "End date/time must be after start date/time.",
    );
  });

  it("requires the application deadline to be before the start time", async () => {
    const data = createValidOpportunity();

    data.applicationDeadline = new Date(
      "2099-07-20T11:00:00.000Z",
    );

    const opportunity = new Opportunity(data);

    const error = await opportunity.validate().catch((err) => err);

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.applicationDeadline).toBeDefined();
    expect(error.errors.applicationDeadline.message).toBe(
      "Application deadline must be before the opportunity start time.",
    );
  });

  it("prevents approved volunteers from exceeding maximum capacity", async () => {
    const data = createValidOpportunity();

    data.maxVolunteers = 10;
    data.approvedVolunteersCount = 11;

    const opportunity = new Opportunity(data);

    const error = await opportunity.validate().catch((err) => err);

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.approvedVolunteersCount).toBeDefined();
    expect(error.errors.approvedVolunteersCount.message).toBe(
      "Approved volunteers count cannot exceed maximum volunteers.",
    );
  });

  it("calculates remaining spots and full state without negative values", () => {
    const data = createValidOpportunity();

    data.maxVolunteers = 20;
    data.approvedVolunteersCount = 5;

    const opportunity = new Opportunity(data);

    expect(opportunity.spotsRemaining).toBe(15);
    expect(opportunity.isFull).toBe(false);

    opportunity.approvedVolunteersCount = 20;

    expect(opportunity.spotsRemaining).toBe(0);
    expect(opportunity.isFull).toBe(true);

    opportunity.approvedVolunteersCount = 25;

    expect(opportunity.spotsRemaining).toBe(0);
    expect(opportunity.isFull).toBe(true);
  });
});