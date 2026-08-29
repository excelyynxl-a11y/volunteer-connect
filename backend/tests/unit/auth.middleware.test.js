import { beforeEach, describe, expect, it, vi } from "vitest";

import jwt from "jsonwebtoken";
import { adminOnly, allowRoles, protectRoute } from "../../src/middlewares/auth.middleware.js";
import { User } from "../../src/models/user.model.js";

vi.mock("jsonwebtoken", () => ({ default: { verify: vi.fn() } }));
vi.mock("../../src/models/user.model.js", () => ({
  User: { findOne: vi.fn() },
}));

const createResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const selectedUser = (user) => ({
  select: vi.fn().mockResolvedValue(user),
});

describe("authentication and role middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("rejects a request with no JWT cookie", async () => {
    const res = createResponse();
    const next = vi.fn();

    await protectRoute({ cookies: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects invalid and expired JWTs", async () => {
    for (const name of ["JsonWebTokenError", "TokenExpiredError"]) {
      jwt.verify.mockImplementationOnce(() => {
        const error = new Error("invalid token");
        error.name = name;
        throw error;
      });
      const res = createResponse();

      await protectRoute({ cookies: { jwt: "bad-token" } }, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorised - Invalid or expired token.",
      });
    }
  });

  it("rejects a valid token when the user no longer exists", async () => {
    jwt.verify.mockReturnValue({ userId: "user-1" });
    User.findOne.mockReturnValue(selectedUser(null));
    const res = createResponse();

    await protectRoute({ cookies: { jwt: "valid-token" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorised - User no longer exists.",
    });
  });

  it("rejects a valid user whose account is not approved", async () => {
    jwt.verify.mockReturnValue({ userId: "user-1" });
    User.findOne.mockReturnValue(selectedUser({
      role: "volunteer",
      approvalStatus: "pending",
    }));
    const res = createResponse();

    await protectRoute({ cookies: { jwt: "valid-token" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      approvalStatus: "pending",
      role: "volunteer",
    }));
  });

  it("attaches the approved user without a password and calls next", async () => {
    const user = { _id: "user-1", role: "organisation", approvalStatus: "approved" };
    const query = selectedUser(user);
    jwt.verify.mockReturnValue({ userId: "user-1" });
    User.findOne.mockReturnValue(query);
    const req = { cookies: { jwt: "valid-token" } };
    const next = vi.fn();

    await protectRoute(req, createResponse(), next);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user-1", deletedAt: null });
    expect(query.select).toHaveBeenCalledWith("-password");
    expect(req.user).toBe(user);
    expect(next).toHaveBeenCalledOnce();
  });

  it("allows only an admin through adminOnly", () => {
    const adminNext = vi.fn();
    adminOnly({ user: { role: "admin" } }, createResponse(), adminNext);
    expect(adminNext).toHaveBeenCalledOnce();

    const res = createResponse();
    const volunteerNext = vi.fn();
    adminOnly({ user: { role: "volunteer" } }, res, volunteerNext);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(volunteerNext).not.toHaveBeenCalled();
  });

  it("allows a role included by allowRoles", () => {
    const next = vi.fn();
    allowRoles("volunteer", "organisation")(
      { user: { role: "organisation" } },
      createResponse(),
      next,
    );
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects a role not included by allowRoles", () => {
    const res = createResponse();
    const next = vi.fn();
    allowRoles("admin")({ user: { role: "volunteer" } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access denied. Allowed roles: admin.",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
