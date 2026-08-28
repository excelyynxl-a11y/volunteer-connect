import mongoose from "mongoose";
import { describe, expect, it } from "vitest";

import Application from "../../src/models/application.model.js";

const validApplication = () => ({
  opportunityId: new mongoose.Types.ObjectId(),
  volunteerId: new mongoose.Types.ObjectId(),
});

describe("application model", () => {
  it("requires an opportunity and volunteer", async () => {
    const error = await new Application({}).validate().catch((value) => value);
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.opportunityId).toBeDefined();
    expect(error.errors.volunteerId).toBeDefined();
  });

  it("defaults status to pending and rejects unsupported statuses", async () => {
    const application = new Application(validApplication());
    expect(application.status).toBe("pending");
    await expect(application.validate()).resolves.toBeUndefined();

    const invalid = new Application({ ...validApplication(), status: "cancelled" });
    const error = await invalid.validate().catch((value) => value);
    expect(error.errors.status).toBeDefined();
  });

  it("trims and limits a withdrawal reason", async () => {
    const application = new Application({
      ...validApplication(),
      withdrawalReason: "  Schedule conflict  ",
    });
    await application.validate();
    expect(application.withdrawalReason).toBe("Schedule conflict");

    const invalid = new Application({
      ...validApplication(),
      withdrawalReason: "x".repeat(501),
    });
    const error = await invalid.validate().catch((value) => value);
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
