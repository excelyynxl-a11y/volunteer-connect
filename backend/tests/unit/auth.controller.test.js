import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/models/user.model.js", () => ({
  User: {
    findOne: vi.fn(),
  },
  Volunteer: vi.fn(),
  Organisation: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock("../../src/lib/cloudinary.js", () => ({
  default: {
    uploader: {
      upload_stream: vi.fn(),
    },
  },
}));

vi.mock("../../src/lib/utils.js", () => ({
  generateToken: vi.fn(),
}));

import bcrypt from "bcryptjs";
import { User } from "../../src/models/user.model.js";
import { login, signup } from "../../src/controllers/auth.controller.js";

const createResponse = () => {
  const response = { body: null, statusCode: null };

  response.status = vi.fn((statusCode) => {
    response.statusCode = statusCode;
    return response;
  });
  response.json = vi.fn((body) => {
    response.body = body;
    return response;
  });

  return response;
};

describe("auth controller security boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not allow public signup to create an admin account", async () => {
    const response = createResponse();

    await signup(
      {
        body: {
          name: "Attacker",
          email: "attacker@example.com",
          password: "Password1",
          role: "admin",
        },
      },
      response,
    );

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("Public signup");
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it("explicitly selects the password hash only during login", async () => {
    const user = {
      _id: "user-id",
      name: "Approved User",
      email: "user@example.com",
      password: "stored-hash",
      role: "volunteer",
      approvalStatus: "approved",
    };
    const select = vi.fn().mockResolvedValue(user);
    User.findOne.mockReturnValue({ select });
    bcrypt.compare.mockResolvedValue(true);
    const response = createResponse();

    await login(
      {
        body: { email: " USER@example.com ", password: "Password1" },
      },
      response,
    );

    expect(User.findOne).toHaveBeenCalledWith({ email: "user@example.com" });
    expect(select).toHaveBeenCalledWith("+password");
    expect(response.statusCode).toBe(200);
  });
});
