import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app.js";

describe("application health endpoint", () => {
  it("reports that the web process is ready", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
