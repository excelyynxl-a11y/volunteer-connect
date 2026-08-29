import { describe, expect, it } from "vitest";
import Opportunity from "../../src/models/opportunity.model.js";

describe("opportunity model", () => {
  it("does not expose the retired images field", () => {
    expect(Opportunity.schema.path("images")).toBeUndefined();

    const opportunity = new Opportunity({ images: ["https://example.com/image.jpg"] });
    expect(opportunity.toObject()).not.toHaveProperty("images");
  });
});
