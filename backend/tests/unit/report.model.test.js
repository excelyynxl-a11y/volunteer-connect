import mongoose from "mongoose";
import { describe, expect, it } from "vitest";

import Report from "../../src/models/report.model.js";

const createUserReport = () => ({
  submittedBy: new mongoose.Types.ObjectId(),
  reportType: "UserViolation",
  userViolationType: "Not Punctual",
  reportedUserId: new mongoose.Types.ObjectId(),
  title: "Repeated late arrival",
  details: "The volunteer arrived after the agreed starting time.",
});

const validationError = async (data) =>
  new Report(data).validate().catch((error) => error);

describe("report model", () => {
  it("requires submitter, report type, title, details, and a valid status", async () => {
    const error = await validationError({ status: "Closed" });

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.submittedBy).toBeDefined();
    expect(error.errors.reportType).toBeDefined();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.details).toBeDefined();
    expect(error.errors.status).toBeDefined();
  });

  it("requires the user subtype and target only for a user violation", async () => {
    const data = createUserReport();
    delete data.userViolationType;
    delete data.reportedUserId;
    const error = await validationError(data);

    expect(error.errors.userViolationType).toBeDefined();
    expect(error.errors.reportedUserId).toBeDefined();
    expect(error.errors.opportunityViolationType).toBeUndefined();
    expect(error.errors.reportedOpportunityId).toBeUndefined();
  });

  it("requires the opportunity subtype and target only for an opportunity violation", async () => {
    const data = { ...createUserReport(), reportType: "OpportunityViolation" };
    delete data.userViolationType;
    delete data.reportedUserId;
    const error = await validationError(data);

    expect(error.errors.opportunityViolationType).toBeDefined();
    expect(error.errors.reportedOpportunityId).toBeDefined();
    expect(error.errors.userViolationType).toBeUndefined();
    expect(error.errors.reportedUserId).toBeUndefined();
  });

  it("rejects unsupported violation subtypes", async () => {
    const userError = await validationError({
      ...createUserReport(),
      userViolationType: "Unsupported",
    });
    expect(userError.errors.userViolationType).toBeDefined();

    const opportunityError = await validationError({
      submittedBy: new mongoose.Types.ObjectId(),
      reportType: "OpportunityViolation",
      opportunityViolationType: "Unsupported",
      reportedOpportunityId: new mongoose.Types.ObjectId(),
      title: "Unsafe event",
      details: "The event did not follow its safety plan.",
    });
    expect(opportunityError.errors.opportunityViolationType).toBeDefined();
  });

  it("trims and limits the report title", async () => {
    const report = new Report({ ...createUserReport(), title: "  Trimmed title  " });
    await report.validate();
    expect(report.title).toBe("Trimmed title");

    const error = await validationError({
      ...createUserReport(),
      title: "x".repeat(121),
    });
    expect(error.errors.title).toBeDefined();
  });
});
