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

const createOpportunityReport = () => ({
  submittedBy: new mongoose.Types.ObjectId(),
  reportType: "OpportunityViolation",
  opportunityViolationType: "Others",
  reportedOpportunityId: new mongoose.Types.ObjectId(),
  title: "A report",
  details: "Some report details",
});

describe("report model", () => {
  it("requires submitter, report type, title, details, and a valid status", () => {
    const error = new Report({ status: "Closed" }).validateSync();

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.submittedBy).toBeDefined();
    expect(error.errors.reportType).toBeDefined();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.details).toBeDefined();
    expect(error.errors.status).toBeDefined();
  });

  it("validates both supported report shapes and defaults status", () => {
    const opportunityReport = new Report(createOpportunityReport());
    const userReport = new Report(createUserReport());

    expect(opportunityReport.status).toBe("Pending");
    expect(opportunityReport.validateSync()).toBeUndefined();
    expect(userReport.validateSync()).toBeUndefined();
  });

  it("requires the matching subtype and target for each report type", () => {
    const missingUser = { ...createUserReport() };
    delete missingUser.userViolationType;
    delete missingUser.reportedUserId;
    const userError = new Report(missingUser).validateSync();
    expect(userError.errors.userViolationType).toBeDefined();
    expect(userError.errors.reportedUserId).toBeDefined();
    expect(userError.errors.opportunityViolationType).toBeUndefined();
    expect(userError.errors.reportedOpportunityId).toBeUndefined();

    const missingOpportunity = { ...createOpportunityReport() };
    delete missingOpportunity.opportunityViolationType;
    delete missingOpportunity.reportedOpportunityId;
    const opportunityError = new Report(missingOpportunity).validateSync();
    expect(opportunityError.errors.opportunityViolationType).toBeDefined();
    expect(opportunityError.errors.reportedOpportunityId).toBeDefined();
  });

  it("rejects unsupported violation subtypes", () => {
    const user = new Report({ ...createUserReport(), userViolationType: "Unsupported" });
    const opportunity = new Report({
      ...createOpportunityReport(),
      opportunityViolationType: "Unsupported",
    });

    expect(user.validateSync().errors.userViolationType).toBeDefined();
    expect(opportunity.validateSync().errors.opportunityViolationType).toBeDefined();
  });

  it("trims and limits report title and details", () => {
    const report = new Report({ ...createUserReport(), title: "  Trimmed title  " });
    expect(report.validateSync()).toBeUndefined();
    expect(report.title).toBe("Trimmed title");

    const longTitle = new Report({ ...createUserReport(), title: "x".repeat(121) });
    const longDetails = new Report({ ...createUserReport(), details: "d".repeat(2001) });
    expect(longTitle.validateSync().errors.title).toBeDefined();
    expect(longDetails.validateSync().errors.details).toBeDefined();
  });
});
