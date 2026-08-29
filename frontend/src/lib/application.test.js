import { describe, expect, it } from "vitest";
import {
  getApplicationBannerMessage,
  getApplicationDisplayStatus,
} from "./application";

describe("application helpers", () => {
  it("returns clear messages for application states", () => {
    expect(getApplicationBannerMessage("pending", "Green Future")).toBe(
      "Your application to Green Future is pending review.",
    );
    expect(getApplicationBannerMessage("approved", "Green Future")).toContain(
      "has been approved",
    );
    expect(getApplicationBannerMessage("unknown", "Green Future")).toBeNull();
  });

  it("locks submitted applications and full opportunities", () => {
    expect(getApplicationDisplayStatus("approved", 2)).toEqual({
      key: "approved",
      isLocked: true,
    });
    expect(getApplicationDisplayStatus(null, 0)).toEqual({
      key: "full",
      isLocked: true,
    });
    expect(getApplicationDisplayStatus(null, 2)).toEqual({
      key: null,
      isLocked: false,
    });
  });
});
