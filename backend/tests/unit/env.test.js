import { afterEach, describe, expect, it } from "vitest";

import { validateEnvironment } from "../../src/config/env.js";

const originalMongoUri = process.env.MONGODB_URI;
const originalJwtSecret = process.env.JWT_SECRET;

afterEach(() => {
  if (originalMongoUri === undefined) delete process.env.MONGODB_URI;
  else process.env.MONGODB_URI = originalMongoUri;
  if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalJwtSecret;
});

describe("server environment validation", () => {
  it("accepts the required MongoDB and JWT settings", () => {
    process.env.MONGODB_URI = "mongodb://localhost/test";
    process.env.JWT_SECRET = "test-secret";

    expect(() => validateEnvironment()).not.toThrow();
  });

  it("reports every missing required setting", () => {
    delete process.env.MONGODB_URI;
    delete process.env.JWT_SECRET;

    expect(() => validateEnvironment()).toThrow(
      "Missing required environment variables: MONGODB_URI, JWT_SECRET",
    );
  });
});
