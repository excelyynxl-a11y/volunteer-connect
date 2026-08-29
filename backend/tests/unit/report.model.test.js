import mongoose from "mongoose";
import { describe, expect, it } from "vitest";

import Report from "../../src/models/report.model.js";

const validReport = () =>
  new Report({
    submittedBy: new mongoose.Types.ObjectId(),
    reportType: "OpportunityViolation",
    opportunityViolationType: "Others",
    title: "A report",
    reportedOpportunityId: new mongoose.Types.ObjectId(),
    details: "Some report details",
  });

describe("report model", () => {
  it("validates the supported opportunity report shape", () => {
    const report = validReport();

    expect(report.status).toBe("Pending");
    expect(report.validateSync()).toBeUndefined();
  });

  it("requires the matching target for each report type", () => {
    const report = new Report({
      submittedBy: new mongoose.Types.ObjectId(),
      reportType: "UserViolation",
      title: "Missing target",
      details: "Details",
    });

    const validationError = report.validateSync();
    expect(validationError.errors.userViolationType).toBeDefined();
    expect(validationError.errors.reportedUserId).toBeDefined();
  });

  it("limits report details to 2,000 characters", () => {
    const report = validReport();
    report.details = "d".repeat(2001);

    expect(report.validateSync().errors.details).toBeDefined();
  });
});
