import { beforeEach, describe, expect, it, vi } from "vitest";

import bcrypt from "bcryptjs";
import cloudinary from "../../src/lib/cloudinary.js";
import { generateToken } from "../../src/lib/utils.js";
import { login, logout, signup } from "../../src/controllers/auth.controller.js";
import { Admin, Organisation, User, Volunteer } from "../../src/models/user.model.js";

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    genSalt: vi.fn(),
    hash: vi.fn(),
  },
}));
vi.mock("../../src/lib/utils.js", () => ({ generateToken: vi.fn() }));
vi.mock("../../src/lib/cloudinary.js", () => ({
  default: { uploader: { upload_stream: vi.fn() } },
}));
vi.mock("../../src/models/user.model.js", () => ({
  User: { findOne: vi.fn() },
  Volunteer: vi.fn(),
  Organisation: vi.fn(),
  Admin: vi.fn(),
}));

const createResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  return res;
};

const baseSignup = (overrides = {}) => ({
  name: "Alex Tan",
  email: "alex@example.com",
  password: "StrongPass1",
  role: "organisation",
  biodata: "Community organisation",
  ...overrides,
});

const createAccount = (data, overrides = {}) => ({
  _id: "507f1f77bcf86cd799439011",
  approvalStatus: "pending",
  avatar: "",
  save: vi.fn().mockResolvedValue(undefined),
  ...data,
  ...overrides,
});

describe("auth controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashed-password");
    User.findOne.mockResolvedValue(null);
    Organisation.mockImplementation(function MockOrganisation(data) {
      return createAccount(data, { role: "organisation" });
    });
    Volunteer.mockImplementation(function MockVolunteer(data) {
      return createAccount(data, { role: "volunteer" });
    });
    Admin.mockImplementation(function MockAdmin(data) {
      return createAccount(data, { role: "admin" });
    });
  });

  describe("signup", () => {
    it("rejects missing or invalid shared signup fields", async () => {
      const invalidBodies = [
        baseSignup({ name: " " }),
        baseSignup({ email: "invalid" }),
        baseSignup({ password: "weak" }),
        baseSignup({ role: "guest" }),
      ];

      for (const body of invalidBodies) {
        const res = createResponse();
        await signup({ body }, res);
        expect(res.status).toHaveBeenCalledWith(400);
      }
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it("normalises name and email before checking and saving the user", async () => {
      const account = createAccount({}, { role: "organisation" });
      Organisation.mockImplementation(function MockOrganisation(data) {
        return Object.assign(account, data);
      });
      const res = createResponse();

      await signup({ body: baseSignup({
        name: "  Alex Tan  ",
        email: "  ALEX@EXAMPLE.COM  ",
        biodata: "  Community organisation  ",
      }) }, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "alex@example.com" });
      expect(Organisation).toHaveBeenCalledWith(expect.objectContaining({
        name: "Alex Tan",
        email: "alex@example.com",
        password: "hashed-password",
        biodata: "Community organisation",
      }));
      expect(account.save).toHaveBeenCalledOnce();
    });

    it("rejects an email that already belongs to a user", async () => {
      User.findOne.mockResolvedValue({ _id: "existing-user" });
      const res = createResponse();

      await signup({ body: baseSignup({ email: "  ALEX@example.com " }) }, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "alex@example.com" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(Organisation).not.toHaveBeenCalled();
    });

    it("requires an age group and uploaded resume for a volunteer", async () => {
      const missingAgeRes = createResponse();
      await signup({
        body: baseSignup({ role: "volunteer", biodata: undefined }),
        file: { buffer: Buffer.from("pdf") },
      }, missingAgeRes);
      expect(missingAgeRes.json).toHaveBeenCalledWith({
        message: "Age group is required for volunteers.",
      });

      const missingResumeRes = createResponse();
      await signup({
        body: baseSignup({ role: "volunteer", ageGroup: "21-30", biodata: undefined }),
      }, missingResumeRes);
      expect(missingResumeRes.json).toHaveBeenCalledWith({
        message: "Resume PDF is required for volunteers.",
      });
      expect(Volunteer).not.toHaveBeenCalled();
    });

    it("requires non-empty biodata for an organisation", async () => {
      const res = createResponse();
      await signup({ body: baseSignup({ biodata: "   " }) }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Biodata is required for organisations.",
      });
    });

    it("returns a safe pending account without issuing a token", async () => {
      const account = createAccount({
        name: "Alex Tan",
        email: "alex@example.com",
        password: "hashed-password",
      }, { role: "organisation", approvalStatus: "pending" });
      Organisation.mockImplementation(function MockOrganisation() {
        return account;
      });
      const res = createResponse();

      await signup({ body: baseSignup() }, res);

      expect(generateToken).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      const response = res.json.mock.calls[0][0];
      expect(response).toMatchObject({
        _id: account._id,
        email: "alex@example.com",
        role: "organisation",
        approvalStatus: "pending",
      });
      expect(response).not.toHaveProperty("password");
    });

    it("issues a token only when the created account is approved", async () => {
      const account = createAccount({
        name: "System Admin",
        email: "admin@example.com",
      }, { role: "admin", approvalStatus: "approved" });
      Admin.mockImplementation(function MockAdmin() {
        return account;
      });
      const res = createResponse();

      await signup({ body: baseSignup({
        name: "System Admin",
        email: "admin@example.com",
        role: "admin",
        biodata: undefined,
      }) }, res);

      expect(generateToken).toHaveBeenCalledWith(account._id, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("returns a safe error when resume upload or persistence fails", async () => {
      cloudinary.uploader.upload_stream.mockImplementation((_options, callback) => ({
        end: () => callback(new Error("upload failed")),
      }));
      const uploadRes = createResponse();
      await signup({
        body: baseSignup({ role: "volunteer", ageGroup: "21-30" }),
        file: { buffer: Buffer.from("pdf") },
      }, uploadRes);
      expect(uploadRes.status).toHaveBeenCalledWith(500);
      expect(uploadRes.json).toHaveBeenCalledWith({ message: "Internal Server Error" });

      const account = createAccount({}, {
        role: "organisation",
        save: vi.fn().mockRejectedValue(new Error("database unavailable")),
      });
      Organisation.mockImplementation(function MockOrganisation() {
        return account;
      });
      const persistenceRes = createResponse();
      await signup({ body: baseSignup() }, persistenceRes);
      expect(persistenceRes.status).toHaveBeenCalledWith(500);
      expect(persistenceRes.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
    });
  });

  describe("login and session", () => {
    it("returns the same response for an unknown email and wrong password", async () => {
      User.findOne.mockResolvedValueOnce(null);
      const unknownRes = createResponse();
      await login({ body: { email: "missing@example.com", password: "Password1" } }, unknownRes);

      User.findOne.mockResolvedValueOnce({ password: "hash" });
      bcrypt.compare.mockResolvedValue(false);
      const wrongRes = createResponse();
      await login({ body: { email: "user@example.com", password: "WrongPass1" } }, wrongRes);

      expect(unknownRes.status).toHaveBeenCalledWith(401);
      expect(wrongRes.status).toHaveBeenCalledWith(401);
      expect(unknownRes.json.mock.calls[0][0]).toEqual(wrongRes.json.mock.calls[0][0]);
    });

    it("blocks pending and rejected accounts without issuing a token", async () => {
      for (const approvalStatus of ["pending", "rejected"]) {
        User.findOne.mockResolvedValueOnce({
          password: "hash",
          approvalStatus,
          role: "volunteer",
        });
        bcrypt.compare.mockResolvedValueOnce(true);
        const res = createResponse();
        await login({ body: { email: "alex@example.com", password: "StrongPass1" } }, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ approvalStatus }));
      }
      expect(generateToken).not.toHaveBeenCalled();
    });

    it("issues a token and returns safe profile fields for an approved user", async () => {
      const user = {
        _id: "user-1",
        name: "Alex Tan",
        email: "alex@example.com",
        password: "hash",
        role: "volunteer",
        approvalStatus: "approved",
        skills: ["First Aid"],
        availability: [],
      };
      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      const res = createResponse();

      await login({ body: { email: " ALEX@example.com ", password: "StrongPass1" } }, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "alex@example.com" });
      expect(generateToken).toHaveBeenCalledWith(user._id, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response).toMatchObject({ _id: user._id, role: "volunteer", skills: ["First Aid"] });
      expect(response).not.toHaveProperty("password");
    });

    it("clears the authentication cookie on logout", async () => {
      const previousEnvironment = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      const res = createResponse();

      await logout({}, res);

      expect(res.clearCookie).toHaveBeenCalledWith("jwt", {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      process.env.NODE_ENV = previousEnvironment;
    });
  });
});
