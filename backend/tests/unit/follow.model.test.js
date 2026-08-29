import mongoose from "mongoose";
import { describe, expect, it } from "vitest";

import Follow from "../../src/models/follow.model.js";

describe("follow model", () => {
  it("requires volunteer and organisation references", () => {
    const error = new Follow({}).validateSync();

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.volunteerId).toBeDefined();
    expect(error.errors.organisationId).toBeDefined();
  });

  it("defines a unique compound index for one follow per pair", () => {
    const indexes = Follow.schema.indexes();

    expect(indexes).toEqual(expect.arrayContaining([
      [{ volunteerId: 1, organisationId: 1 }, expect.objectContaining({ unique: true })],
    ]));
  });
});
