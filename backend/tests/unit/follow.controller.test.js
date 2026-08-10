import mongoose from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/models/follow.model.js", () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock("../../src/models/user.model.js", () => ({
  Organisation: {
    findOne: vi.fn(),
  },
}));

import {
  followOrganisation,
  getOrganisationFollowers,
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
});
