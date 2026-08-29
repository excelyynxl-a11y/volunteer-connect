import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  deleteUser,
  getAllAdmins,
  getAllOrganisations,
  getAllUsers,
  getAllVolunteers,
  getUserById,
} from "../../src/controllers/user.controller.js";
import { Admin, Organisation, User, Volunteer } from "../../src/models/user.model.js";

vi.mock("../../src/models/user.model.js", () => ({
  User: { find: vi.fn(), findOne: vi.fn(), findOneAndUpdate: vi.fn() },
  Volunteer: { find: vi.fn() },
  Organisation: { find: vi.fn() },
  Admin: { find: vi.fn() },
}));

const createResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};
const selected = (value) => ({ select: vi.fn().mockResolvedValue(value) });

describe("admin user-management controller", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists users without password or internal version fields", async () => {
    const users = [{ _id: "user-1", name: "Alex" }];
    const query = selected(users);
    User.find.mockReturnValue(query);
    const res = createResponse();

    await getAllUsers({}, res);

    expect(query.select).toHaveBeenCalledWith("-password -__v");
    expect(res.json).toHaveBeenCalledWith({ count: 1, users });
  });

  it("lists volunteers, organisations, and admins from the correct model", async () => {
    const cases = [
      [getAllVolunteers, Volunteer, "volunteers"],
      [getAllOrganisations, Organisation, "organisations"],
      [getAllAdmins, Admin, "admins"],
    ];

    for (const [controller, model, key] of cases) {
      const records = [{ _id: `${key}-1` }];
      const query = selected(records);
      model.find.mockReturnValue(query);
      const res = createResponse();
      await controller({}, res);
      expect(model.find).toHaveBeenCalledWith({ deletedAt: null });
      expect(query.select).toHaveBeenCalledWith("-password -__v");
      expect(res.json).toHaveBeenCalledWith({ count: 1, [key]: records });
    }
  });

  it("returns one safe user by ID", async () => {
    const user = { _id: "user-1", name: "Alex" };
    const query = selected(user);
    User.findOne.mockReturnValue(query);
    const res = createResponse();

    await getUserById({ params: { id: "user-1" } }, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "user-1", deletedAt: null });
    expect(query.select).toHaveBeenCalledWith("-password -__v");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user });
  });

  it("returns not found when the requested user does not exist", async () => {
    User.findOne.mockReturnValue(selected(null));
    const res = createResponse();
    await getUserById({ params: { id: "missing" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deletes an existing user and reports success", async () => {
    User.findOne.mockResolvedValue({ _id: "user-1" });
    User.findOneAndUpdate.mockResolvedValue({ _id: "user-1" });
    const res = createResponse();
    await deleteUser({ params: { id: "user-1" } }, res);
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "user-1", deletedAt: null },
      expect.objectContaining({ $set: expect.objectContaining({ approvalStatus: "rejected" }) }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("does not report success when the user to delete is missing", async () => {
    User.findOne.mockResolvedValue(null);
    const res = createResponse();
    await deleteUser({ params: { id: "missing" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(User.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("returns a safe server error when a user query fails", async () => {
    User.find.mockImplementation(() => {
      throw new Error("database unavailable");
    });
    const res = createResponse();
    await getAllUsers({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "database unavailable" });
  });
});
