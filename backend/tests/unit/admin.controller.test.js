import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  approveUserAccount,
  rejectUserAccount,
  updateAdminProfile,
} from "../../src/controllers/admin.controller.js";
import { Admin, User } from "../../src/models/user.model.js";
import { uploadAvatarToCloudinary } from "../../src/services/cloudinary.service.js";

vi.mock("../../src/models/user.model.js", () => ({
  User: { findById: vi.fn() },
  Admin: { findById: vi.fn() },
}));
vi.mock("../../src/services/cloudinary.service.js", () => ({
  uploadAvatarToCloudinary: vi.fn(),
}));

const validId = "507f1f77bcf86cd799439011";
const createResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};
const selected = (value) => ({ select: vi.fn().mockResolvedValue(value) });

describe("admin controller", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("account review", () => {
    it("rejects an invalid or missing user ID", async () => {
      const invalidRes = createResponse();
      await approveUserAccount({ params: { id: "invalid" } }, invalidRes);
      expect(invalidRes.status).toHaveBeenCalledWith(400);

      User.findById.mockResolvedValue(null);
      const missingRes = createResponse();
      await rejectUserAccount({ params: { id: validId } }, missingRes);
      expect(missingRes.status).toHaveBeenCalledWith(404);
    });

    it("rejects attempts to review an admin account", async () => {
      User.findById.mockResolvedValue({ role: "admin", approvalStatus: "pending" });
      const res = createResponse();
      await approveUserAccount({ params: { id: validId } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Only volunteer and organisation accounts can be reviewed.",
      });
    });

    it("approves a pending volunteer or organisation and returns safe fields", async () => {
      const user = {
        _id: validId,
        role: "volunteer",
        approvalStatus: "pending",
        save: vi.fn().mockResolvedValue(undefined),
      };
      const safeUser = { _id: validId, role: "volunteer", approvalStatus: "approved" };
      User.findById.mockResolvedValueOnce(user).mockReturnValueOnce(selected(safeUser));
      const res = createResponse();

      await approveUserAccount({ params: { id: validId } }, res);

      expect(user.approvalStatus).toBe("approved");
      expect(user.save).toHaveBeenCalledOnce();
      expect(res.json).toHaveBeenCalledWith({
        message: "User account approved successfully.",
        user: safeUser,
      });
      expect(User.findById.mock.results[1].value.select).toHaveBeenCalledWith("-password -__v");
    });

    it("rejects a volunteer or organisation and returns safe fields", async () => {
      const user = {
        _id: validId,
        role: "organisation",
        approvalStatus: "pending",
        save: vi.fn().mockResolvedValue(undefined),
      };
      const safeUser = { _id: validId, role: "organisation", approvalStatus: "rejected" };
      User.findById.mockResolvedValueOnce(user).mockReturnValueOnce(selected(safeUser));
      const res = createResponse();

      await rejectUserAccount({ params: { id: validId } }, res);

      expect(user.approvalStatus).toBe("rejected");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ user: safeUser }));
    });

    it("rejects an already completed approval or rejection", async () => {
      User.findById.mockResolvedValueOnce({ role: "volunteer", approvalStatus: "approved" });
      const approvedRes = createResponse();
      await approveUserAccount({ params: { id: validId } }, approvedRes);
      expect(approvedRes.status).toHaveBeenCalledWith(400);

      User.findById.mockResolvedValueOnce({ role: "organisation", approvalStatus: "rejected" });
      const rejectedRes = createResponse();
      await rejectUserAccount({ params: { id: validId } }, rejectedRes);
      expect(rejectedRes.status).toHaveBeenCalledWith(400);
    });

    it("returns a safe server error when account review persistence fails", async () => {
      User.findById.mockResolvedValue({
        _id: validId,
        role: "volunteer",
        approvalStatus: "pending",
        save: vi.fn().mockRejectedValue(new Error("database unavailable")),
      });
      const res = createResponse();
      await approveUserAccount({ params: { id: validId } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
    });
  });

  describe("admin profile", () => {
    it("requires at least one profile field", async () => {
      const res = createResponse();
      await updateAdminProfile({ user: { _id: validId }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(Admin.findById).not.toHaveBeenCalled();
    });

    it("validates and trims the admin name", async () => {
      for (const name of ["", " ", "x".repeat(121), 42]) {
        const res = createResponse();
        await updateAdminProfile({ user: { _id: validId }, body: { name } }, res);
        expect(res.status).toHaveBeenCalledWith(400);
      }

      const admin = { save: vi.fn().mockResolvedValue(undefined) };
      Admin.findById.mockResolvedValueOnce(admin).mockReturnValueOnce(selected({
        _id: validId,
        name: "System Admin",
      }));
      const res = createResponse();
      await updateAdminProfile({
        user: { _id: validId },
        body: { name: "  System Admin  " },
      }, res);
      expect(admin.name).toBe("System Admin");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("uploads an avatar through the Cloudinary service boundary", async () => {
      const admin = { save: vi.fn().mockResolvedValue(undefined) };
      Admin.findById.mockResolvedValueOnce(admin).mockReturnValueOnce(selected({ _id: validId }));
      uploadAvatarToCloudinary.mockResolvedValue("https://cloudinary.test/avatar.jpg");
      const file = { buffer: Buffer.from("avatar") };

      await updateAdminProfile({ user: { _id: validId }, body: {}, file }, createResponse());

      expect(uploadAvatarToCloudinary).toHaveBeenCalledWith(file.buffer);
      expect(admin.avatar).toBe("https://cloudinary.test/avatar.jpg");
    });

    it("returns a safe error when avatar upload or persistence fails", async () => {
      Admin.findById.mockResolvedValue({ save: vi.fn() });
      uploadAvatarToCloudinary.mockRejectedValue(new Error("upload failed"));
      const res = createResponse();
      await updateAdminProfile({
        user: { _id: validId },
        body: {},
        file: { buffer: Buffer.from("avatar") },
      }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal Server Error",
      });
    });
  });
});
