import mongoose from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/models/follow.model.js", () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

vi.mock("../../src/models/user.model.js", () => ({
  Organisation: {
    findOne: vi.fn(),
  },
}));

import {
  followOrganisation,
  getFollowStatus,
  getMyFollowedOrganisations,
  getOrganisationFollowers,
  unfollowOrganisation,
} from "../../src/controllers/follow.controller.js";
import Follow from "../../src/models/follow.model.js";
import { Organisation } from "../../src/models/user.model.js";

const createResponse = () => {
  const response = {
    body: null,
    statusCode: null,
  };

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

const createUser = (role, _id = new mongoose.Types.ObjectId()) => ({
  _id,
  role,
});

const mockApprovedOrganisation = (organisation) => {
  Organisation.findOne.mockReturnValue({
    select: vi.fn().mockResolvedValue(organisation),
  });
};

describe("follow controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps a concurrent duplicate follow to conflict", async () => {
    const volunteer = createUser("volunteer");
    const organisationId = new mongoose.Types.ObjectId();
    mockApprovedOrganisation({ _id: organisationId });
    Follow.findOne.mockResolvedValue(null);
    Follow.create.mockRejectedValue({ code: 11000 });
    const response = createResponse();

    await followOrganisation(
      {
        params: { organisationId: String(organisationId) },
        user: volunteer,
      },
      response,
    );

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe("Organisation is already followed");
  });

  it("allows an organisation to view its approved followers", async () => {
    const organisationId = new mongoose.Types.ObjectId();
    const volunteerId = new mongoose.Types.ObjectId();
    const organisation = createUser("organisation", organisationId);
    mockApprovedOrganisation({ _id: organisationId });
    Follow.find.mockReturnValue({
      populate: vi.fn().mockResolvedValue([
        {
          volunteerId: {
            _id: volunteerId,
            name: "Alex Volunteer",
            avatar: "avatar-url",
            email: "private@example.com",
            skills: ["first aid"],
          },
        },
        { volunteerId: null },
      ]),
    });
    const response = createResponse();

    await getOrganisationFollowers(
      {
        params: { organisationId: String(organisationId) },
        user: organisation,
      },
      response,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      count: 1,
      data: [
        {
          _id: volunteerId,
          name: "Alex Volunteer",
          avatar: "avatar-url",
        },
      ],
    });
  });

  it("prevents an organisation from viewing another organisation's followers", async () => {
    const requestedOrganisationId = new mongoose.Types.ObjectId();
    const organisation = createUser("organisation");
    const response = createResponse();

    await getOrganisationFollowers(
      {
        params: { organisationId: String(requestedOrganisationId) },
        user: organisation,
      },
      response,
    );

    expect(response.statusCode).toBe(403);
    expect(Organisation.findOne).not.toHaveBeenCalled();
  });

  it("allows an admin to view an approved organisation's followers", async () => {
    const organisationId = new mongoose.Types.ObjectId();
    mockApprovedOrganisation({ _id: organisationId });
    Follow.find.mockReturnValue({
      populate: vi.fn().mockResolvedValue([]),
    });
    const response = createResponse();

    await getOrganisationFollowers(
      {
        params: { organisationId: String(organisationId) },
        user: createUser("admin"),
      },
      response,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it("rejects an invalid organisation ID", async () => {
    const response = createResponse();

    await getOrganisationFollowers(
      {
        params: { organisationId: "invalid-id" },
        user: createUser("admin"),
      },
      response,
    );

    expect(response.statusCode).toBe(400);
    expect(Organisation.findOne).not.toHaveBeenCalled();
  });

  it("creates a follow for an approved organisation and returns safe fields", async () => {
    const volunteer = createUser("volunteer");
    const organisationId = new mongoose.Types.ObjectId();
    const follow = {
      _id: new mongoose.Types.ObjectId(),
      volunteerId: volunteer._id,
      organisationId,
    };
    Organisation.findOne.mockResolvedValue({ _id: organisationId });
    Follow.findOne.mockResolvedValue(null);
    Follow.create.mockResolvedValue(follow);
    const response = createResponse();

    await followOrganisation({
      params: { organisationId: String(organisationId) },
      user: volunteer,
    }, response);

    expect(Organisation.findOne).toHaveBeenCalledWith({
      _id: String(organisationId),
      approvalStatus: "approved",
    });
    expect(Follow.create).toHaveBeenCalledWith({
      volunteerId: volunteer._id,
      organisationId: String(organisationId),
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.data).toBe(follow);
  });

  it("rejects a missing, unapproved, or already followed organisation", async () => {
    const volunteer = createUser("volunteer");
    const organisationId = new mongoose.Types.ObjectId();
    Organisation.findOne.mockResolvedValueOnce(null);
    const missingResponse = createResponse();
    await followOrganisation({
      params: { organisationId: String(organisationId) },
      user: volunteer,
    }, missingResponse);
    expect(missingResponse.statusCode).toBe(404);

    Organisation.findOne.mockResolvedValueOnce({ _id: organisationId });
    Follow.findOne.mockResolvedValueOnce({ _id: "existing-follow" });
    const duplicateResponse = createResponse();
    await followOrganisation({
      params: { organisationId: String(organisationId) },
      user: volunteer,
    }, duplicateResponse);
    expect(duplicateResponse.statusCode).toBe(409);
    expect(Follow.create).not.toHaveBeenCalled();
  });

  it("makes unfollow idempotent for an existing or missing relationship", async () => {
    const volunteer = createUser("volunteer");
    const organisationId = new mongoose.Types.ObjectId();
    for (const deleted of [{ _id: "follow-1" }, null]) {
      Follow.findOneAndDelete.mockResolvedValueOnce(deleted);
      const response = createResponse();
      await unfollowOrganisation({
        params: { organisationId: String(organisationId) },
        user: volunteer,
      }, response);
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    }
    expect(Follow.findOneAndDelete).toHaveBeenCalledTimes(2);
  });

  it("returns true and false follow status for the authenticated volunteer", async () => {
    const volunteer = createUser("volunteer");
    const organisationId = new mongoose.Types.ObjectId();
    for (const follow of [{ _id: "follow-1" }, null]) {
      Follow.findOne.mockResolvedValueOnce(follow);
      const response = createResponse();
      await getFollowStatus({
        params: { organisationId: String(organisationId) },
        user: volunteer,
      }, response);
      expect(response.body.data.isFollowing).toBe(Boolean(follow));
    }
  });

  it("lists only approved followed organisations with safe fields", async () => {
    const volunteer = createUser("volunteer");
    const organisation = {
      _id: new mongoose.Types.ObjectId(),
      name: "Green Neighbours",
      avatar: "avatar-url",
      biodata: "Community projects",
    };
    const populate = vi.fn().mockResolvedValue([
      { organisationId: organisation },
      { organisationId: null },
    ]);
    Follow.find.mockReturnValue({ populate });
    const response = createResponse();

    await getMyFollowedOrganisations({ user: volunteer }, response);

    expect(Follow.find).toHaveBeenCalledWith({ volunteerId: volunteer._id });
    expect(populate).toHaveBeenCalledWith({
      path: "organisationId",
      select: "_id name avatar biodata",
      match: { approvalStatus: "approved" },
    });
    expect(response.body).toEqual({ success: true, count: 1, data: [organisation] });
  });

  it("handles model failures without returning stale success data", async () => {
    const volunteer = createUser("volunteer");
    const organisationId = new mongoose.Types.ObjectId();
    Organisation.findOne.mockRejectedValue(new Error("database unavailable"));
    const response = createResponse();

    await followOrganisation({
      params: { organisationId: String(organisationId) },
      user: volunteer,
    }, response);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
    });
    expect(Follow.create).not.toHaveBeenCalled();
  });
});
