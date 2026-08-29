import { describe, expect, it, vi, beforeEach } from "vitest";
import { getOrgProfile, updateOrgProfile } from "../../src/controllers/organisation.controller.js";
import { Organisation } from "../../src/models/user.model.js";
import { uploadAvatarToCloudinary } from "../../src/services/cloudinary.service.js";

// Mock external dependencies
vi.mock("../../src/models/user.model.js", () => ({
  Organisation: {
    findOne: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock("../../src/services/cloudinary.service.js", () => ({
  uploadAvatarToCloudinary: vi.fn(),
}));

const createResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("organisation controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("public profile", () => {
    it("rejects an invalid organisation ID", async () => {
      const req = { params: { id: "invalid-id" } };
      const res = createResponse();

      await getOrgProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid organisation ID",
      });
    });

    it("returns not found for a missing or unapproved organisation", async () => {
      const validId = "507f1f77bcf86cd799439011";
      const req = { params: { id: validId } };
      const res = createResponse();

      // Mock chain: findOne().select() -> returns null
      Organisation.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      await getOrgProfile(req, res);

      expect(Organisation.findOne).toHaveBeenCalledWith({
        _id: validId,
        approvalStatus: "approved",
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Organisation not found",
      });
    });

    it("returns only name, avatar, and biodata for an approved organisation", async () => {
      const validId = "507f1f77bcf86cd799439011";
      const mockOrg = {
        name: "Test Org",
        avatar: "https://example.com/avatar.jpg",
        biodata: "Test bio",
      };

      const req = { params: { id: validId } };
      const res = createResponse();

      Organisation.findOne.mockReturnValue({
        select: vi.fn().mockImplementation((fields) => {
          expect(fields).toBe("name avatar biodata");
          return Promise.resolve(mockOrg);
        }),
      });

      await getOrgProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrg,
      });
    });
  });

  describe("own profile update", () => {
    it("uses the authenticated organisation identity", async () => {
      const userId = "507f1f77bcf86cd799439011";
      const req = {
        user: { _id: userId },
        body: { name: "Updated Org" },
      };
      const res = createResponse();

      const mockDoc = {
        save: vi.fn().mockResolvedValue(true),
      };

      Organisation.findById.mockResolvedValueOnce(mockDoc);
      Organisation.findById.mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({ _id: userId, name: "Updated Org" }),
      });

      await updateOrgProfile(req, res);

      expect(Organisation.findById).toHaveBeenCalledWith(userId);
    });

    it("requires at least one field or avatar", async () => {
      const req = {
        user: { _id: "507f1f77bcf86cd799439011" },
        body: {},
      };
      const res = createResponse();

      await updateOrgProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "At least one profile field must be provided",
      });
    });

    it("validates and trims name and biodata", async () => {
      const req = {
        user: { _id: "507f1f77bcf86cd799439011" },
        body: { name: "  Trimmed Name  ", biodata: "  Trimmed Bio  " },
      };
      const res = createResponse();

      const mockDoc = {
        name: "",
        biodata: "",
        save: vi.fn().mockResolvedValue(true),
      };

      Organisation.findById.mockResolvedValueOnce(mockDoc);
      Organisation.findById.mockReturnValueOnce({
        select: vi.fn().mockResolvedValue(mockDoc),
      });

      await updateOrgProfile(req, res);

      expect(mockDoc.name).toBe("Trimmed Name");
      expect(mockDoc.biodata).toBe("Trimmed Bio");
    });

    it("uploads an avatar through the Cloudinary service boundary", async () => {
      const req = {
        user: { _id: "507f1f77bcf86cd799439011" },
        body: {},
        file: { buffer: Buffer.from("test image") },
      };
      const res = createResponse();

      const mockDoc = {
        avatar: "",
        save: vi.fn().mockResolvedValue(true),
      };

      uploadAvatarToCloudinary.mockResolvedValue("https://cloudinary.com/new-avatar.jpg");
      Organisation.findById.mockResolvedValueOnce(mockDoc);
      Organisation.findById.mockReturnValueOnce({
        select: vi.fn().mockResolvedValue(mockDoc),
      });

      await updateOrgProfile(req, res);

      expect(uploadAvatarToCloudinary).toHaveBeenCalledWith(req.file.buffer);
      expect(mockDoc.avatar).toBe("https://cloudinary.com/new-avatar.jpg");
    });

    it("returns safe saved profile fields", async () => {
      const userId = "507f1f77bcf86cd799439011";
      const req = {
        user: { _id: userId },
        body: { name: "Safe Name" },
      };
      const res = createResponse();

      const mockDoc = { save: vi.fn().mockResolvedValue(true) };
      const safeReturnedOrg = { _id: userId, name: "Safe Name", role: "organisation" };

      Organisation.findById.mockResolvedValueOnce(mockDoc);
      Organisation.findById.mockReturnValueOnce({
        select: vi.fn().mockImplementation((selectString) => {
          expect(selectString).toBe("-password -__v");
          return Promise.resolve(safeReturnedOrg);
        }),
      });

      await updateOrgProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Organisation profile updated successfully",
        data: safeReturnedOrg,
      });
    });

    it("returns a safe error when avatar upload or persistence fails", async () => {
      const req = {
        user: { _id: "507f1f77bcf86cd799439011" },
        body: {},
        file: { buffer: Buffer.from("test") },
      };
      const res = createResponse();

      Organisation.findById.mockResolvedValueOnce({
        save: vi.fn(),
      });
      uploadAvatarToCloudinary.mockRejectedValue(new Error("Cloudinary error"));

      await updateOrgProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal Server Error",
      });
    });
  });
});