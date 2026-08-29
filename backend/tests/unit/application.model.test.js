import mongoose from "mongoose";
import { describe, expect, it } from "vitest";

import Application from "../../src/models/application.model.js";

const validApplication = () => ({
  opportunityId: new mongoose.Types.ObjectId(),
  volunteerId: new mongoose.Types.ObjectId(),
});

describe("application model", () => {
  it("requires an opportunity and volunteer", () => {
    const error = new Application({}).validateSync();

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.opportunityId).toBeDefined();
    expect(error.errors.volunteerId).toBeDefined();
  });

  it("defaults status to pending and supports the defined lifecycle", () => {
    const application = new Application(validApplication());

    expect(application.status).toBe("pending");
    expect(application.validateSync()).toBeUndefined();
    expect(Application.schema.path("status").enumValues).toEqual([
      "pending",
      "approved",
      "rejected",
      "withdrawn",
    ]);

    const invalid = new Application({ ...validApplication(), status: "cancelled" });
    expect(invalid.validateSync().errors.status).toBeDefined();
  });

  it("trims and limits moderation and withdrawal reasons", () => {
    const application = new Application({
      ...validApplication(),
      rejectionReason: "  Not available  ",
      withdrawalReason: "  Schedule conflict  ",
    });

    expect(application.validateSync()).toBeUndefined();
    expect(application.rejectionReason).toBe("Not available");
    expect(application.withdrawalReason).toBe("Schedule conflict");

    const invalid = new Application({
      ...validApplication(),
      rejectionReason: "r".repeat(501),
      withdrawalReason: "w".repeat(501),
    });
    const error = invalid.validateSync();
    expect(error.errors.rejectionReason).toBeDefined();
    expect(error.errors.withdrawalReason).toBeDefined();
  });

  it("defines one application per volunteer and opportunity pair", () => {
    const indexes = Application.schema.indexes();
    expect(indexes).toEqual(expect.arrayContaining([
      [{ volunteerId: 1, opportunityId: 1 }, expect.objectContaining({ unique: true })],
    ]));
  });

  it("defines indexes used by volunteer and status queries", () => {
    const indexes = Application.schema.indexes();
    expect(indexes).toEqual(expect.arrayContaining([
      [{ volunteerId: 1, status: 1 }, expect.any(Object)],
      [{ opportunityId: 1, status: 1 }, expect.any(Object)],
    ]));
  });
});
