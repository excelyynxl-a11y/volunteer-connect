import mongoose from "mongoose";
import { describe, expect, it } from "vitest";

import Application from "../../src/models/application.model.js";

const validApplication = () =>
  new Application({
    opportunityId: new mongoose.Types.ObjectId(),
    volunteerId: new mongoose.Types.ObjectId(),
  });

describe("application model", () => {
  it("uses pending as the default status and supports the defined lifecycle", () => {
    const application = validApplication();

    expect(application.status).toBe("pending");
    expect(application.validateSync()).toBeUndefined();
    expect(Application.schema.path("status").enumValues).toEqual([
      "pending",
      "approved",
      "rejected",
      "withdrawn",
    ]);
  });

  it("limits moderation and withdrawal reasons", () => {
    const application = validApplication();
    application.rejectionReason = "r".repeat(501);

    expect(application.validateSync().errors.rejectionReason).toBeDefined();

    application.rejectionReason = "";
    application.withdrawalReason = "w".repeat(501);
    expect(application.validateSync().errors.withdrawalReason).toBeDefined();
  });

  it("enforces one application per volunteer and opportunity pair", () => {
    const uniqueIndex = Application.schema.indexes().find(
      ([fields, options]) =>
        fields.volunteerId === 1 &&
        fields.opportunityId === 1 &&
        options.unique === true,
    );

    expect(uniqueIndex).toBeDefined();
  });
});
