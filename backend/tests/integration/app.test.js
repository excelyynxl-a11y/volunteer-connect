import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../../src/app.js";

describe("application health endpoint", () => {
  it("reports that the web process is ready", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
    expect(response.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/i);
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("reports database readiness without starting a database connection", async () => {
    const response = await request(app).get("/api/health/ready");

    expect([200, 503]).toContain(response.status);
    expect(response.body).toMatchObject({
      status: response.status === 200 ? "ready" : "not ready",
      database: response.status === 200 ? "connected" : "disconnected",
    });
  });

  it("keeps the development root endpoint available", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("rejects protected API calls before a controller can access private data", async () => {
    const protectedRequests = [
      ["get", "/api/admin/users"],
      ["get", "/api/analytics/volunteer-signups"],
      ["get", "/api/application"],
      ["get", "/api/follow/me"],
      ["get", "/api/message/conversations"],
      ["get", "/api/report/my-reports"],
      ["get", "/api/user"],
      ["get", "/api/volunteer/profile/507f1f77bcf86cd799439011"],
    ];

    for (const [method, path] of protectedRequests) {
      const response = await request(app)[method](path);

      expect(response.status, `${method.toUpperCase()} ${path}`).toBe(401);
      expect(response.body.message).toMatch(/no token/i);
    }
  });

  it("validates public authentication and public identifier inputs at the API boundary", async () => {
    const signupResponse = await request(app)
      .post("/api/auth/signup")
      .send({ name: "", email: "not-an-email", password: "weak", role: "admin" });
    expect(signupResponse.status).toBe(400);
    expect(signupResponse.body.message).toBe("Name is required.");

    const roleResponse = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Alex Tan",
        email: "alex@example.com",
        password: "Password1",
        role: "admin",
      });
    expect(roleResponse.status).toBe(400);
    expect(roleResponse.body.message).toMatch(/public signup/i);

    const opportunityResponse = await request(app).get("/api/opportunities/not-an-object-id");
    expect(opportunityResponse.status).toBe(400);
    expect(opportunityResponse.body.message).toBe("Invalid opportunity ID");
  });
});
