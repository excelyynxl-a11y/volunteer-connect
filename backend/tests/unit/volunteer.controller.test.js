import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findVolunteerByIdMock,
  findApplicationsMock,
  isValidObjectIdMock,
  uploadAvatarMock,
  parseArrayFieldMock,
  normalizeSkillsMock,
  normalizeAvailabilityMock,
  getAvailabilityValidationErrorMock,
  sortAvailabilityMock,
} = vi.hoisted(() => ({
  findVolunteerByIdMock: vi.fn(),
  findApplicationsMock: vi.fn(),
  isValidObjectIdMock: vi.fn(),
  uploadAvatarMock: vi.fn(),
  parseArrayFieldMock: vi.fn(),
  normalizeSkillsMock: vi.fn(),
  normalizeAvailabilityMock: vi.fn(),
  getAvailabilityValidationErrorMock: vi.fn(),
  sortAvailabilityMock: vi.fn(),
}));

vi.mock("../../src/models/user.model.js", () => ({
  Volunteer: {
    findById: findVolunteerByIdMock,
  },
}));

vi.mock("../../src/models/application.model.js", () => ({
  default: {
    find: findApplicationsMock,
  },
}));

vi.mock("mongoose", () => ({
  default: {
    Types: {
      ObjectId: {
        isValid: isValidObjectIdMock,
      },
    },
  },
}));

vi.mock("../../src/services/cloudinary.service.js", () => ({
  uploadAvatarToCloudinary: uploadAvatarMock,
}));

vi.mock("../../src/lib/volunteer.js", () => ({
  normalizeSkills: normalizeSkillsMock,
  parseArrayField: parseArrayFieldMock,
  validAgeGroups: ["21-30", "31-40", "41-50", "51-60", "60+"],
}));

vi.mock("../../src/lib/availability.js", () => ({
  getAvailabilityValidationError: getAvailabilityValidationErrorMock,
  normalizeAvailability: normalizeAvailabilityMock,
  sortAvailability: sortAvailabilityMock,
}));

import {
  getVolunteerProfile,
  updateVolunteerProfile,
  getVolunteerPastExperience,
} from "../../src/controllers/volunteer.controller.js";

const createResponse = () => {
  const res = {};

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);

  return res;
};

const createFindByIdChain = (value) => ({
  select: vi.fn().mockResolvedValue(value),
});

const createVolunteer = (overrides = {}) => ({
  name: "John Doe",
  email: "john@example.com",
  avatar: "avatar.jpg",
  ageGroup: "21-30",
  resume: "resume.pdf",
  biodata: "Volunteer biodata",
  skills: ["JavaScript"],
  availability: [],
  approvalStatus: "approved",
  save: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();

  isValidObjectIdMock.mockReturnValue(true);

  parseArrayFieldMock.mockImplementation((value) => value);

  normalizeSkillsMock.mockImplementation((skills) => skills);

  normalizeAvailabilityMock.mockImplementation(
    (availability) => availability,
  );

  getAvailabilityValidationErrorMock.mockReturnValue("");

  sortAvailabilityMock.mockImplementation((availability) => availability);

  uploadAvatarMock.mockResolvedValue("uploaded-avatar.jpg");
});

describe("getVolunteerProfile", () => {
  it("returns 400 when the volunteer ID is invalid", async () => {
    isValidObjectIdMock.mockReturnValue(false);

    const req = {
      params: {
        id: "invalid-id",
      },
    };
    const res = createResponse();

    await getVolunteerProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid volunteer ID",
    });

    expect(findVolunteerByIdMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the volunteer does not exist", async () => {
    findVolunteerByIdMock.mockReturnValue(
      createFindByIdChain(null),
    );

    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
    };
    const res = createResponse();

    await getVolunteerProfile(req, res);

    expect(findVolunteerByIdMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Volunteer not found",
    });
  });

  it("returns the volunteer profile successfully", async () => {
    const volunteer = createVolunteer();

    findVolunteerByIdMock.mockReturnValue(
      createFindByIdChain(volunteer),
    );

    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
    };
    const res = createResponse();

    await getVolunteerProfile(req, res);

    expect(findVolunteerByIdMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: volunteer,
    });
  });

  it("returns 500 when retrieving the volunteer fails", async () => {
    findVolunteerByIdMock.mockReturnValue({
      select: vi.fn().mockRejectedValue(new Error("Database error")),
    });

    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
    };
    const res = createResponse();

    await getVolunteerProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Database error",
    });
  });
});

describe("updateVolunteerProfile", () => {
  it("returns 400 when the volunteer ID is invalid", async () => {
    isValidObjectIdMock.mockReturnValue(false);

    const req = {
      params: {
        id: "invalid-id",
      },
      user: {
        _id: "invalid-id",
      },
      body: {
        fullName: "John Doe",
      },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid volunteer ID",
    });

    expect(findVolunteerByIdMock).not.toHaveBeenCalled();
  });

  it("returns 403 when a user tries to update another volunteer's profile", async () => {
    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
      user: {
        _id: "507f1f77bcf86cd799439012",
      },
      body: {
        fullName: "John Doe",
      },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "You can only update your own profile",
    });

    expect(findVolunteerByIdMock).not.toHaveBeenCalled();
  });

  it("returns 400 when no profile fields are provided", async () => {
    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
      user: {
        _id: "507f1f77bcf86cd799439011",
      },
      body: {},
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "At least one profile field must be provided",
    });
  });

  it("returns 400 when the age group is invalid", async () => {
    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
      user: {
        _id: "507f1f77bcf86cd799439011",
      },
      body: {
        ageGroup: "18-20",
      },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid age group",
    });
  });

  it("updates the volunteer profile successfully", async () => {
    const volunteer = createVolunteer();

    const updatedVolunteer = {
      ...volunteer,
      name: "Jane Doe",
      ageGroup: "31-40",
      biodata: "Updated biodata",
      skills: ["JavaScript", "React"],
    };

    findVolunteerByIdMock
      .mockReturnValueOnce(
        Promise.resolve(volunteer),
      )
      .mockReturnValueOnce(
        createFindByIdChain(updatedVolunteer),
      );

    parseArrayFieldMock.mockImplementation((value) => value);

    normalizeSkillsMock.mockReturnValue([
      "JavaScript",
      "React",
    ]);

    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
      user: {
        _id: "507f1f77bcf86cd799439011",
      },
      body: {
        fullName: " Jane Doe ",
        ageGroup: "31-40",
        biodata: " Updated biodata ",
        skills: ["JavaScript", "React"],
      },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(volunteer.name).toBe("Jane Doe");
    expect(volunteer.ageGroup).toBe("31-40");
    expect(volunteer.biodata).toBe("Updated biodata");
    expect(volunteer.skills).toEqual([
      "JavaScript",
      "React",
    ]);

    expect(volunteer.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Volunteer profile updated successfully",
      data: updatedVolunteer,
    });
  });
});

describe("getVolunteerPastExperience", () => {
  it("returns 400 when the volunteer ID is invalid", async () => {
    isValidObjectIdMock.mockReturnValue(false);

    const req = {
      params: {
        id: "invalid-id",
      },
    };
    const res = createResponse();

    await getVolunteerPastExperience(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid volunteer ID",
    });

    expect(findVolunteerByIdMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the volunteer does not exist", async () => {
    findVolunteerByIdMock.mockReturnValue(
      createFindByIdChain(null),
    );

    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
    };
    const res = createResponse();

    await getVolunteerPastExperience(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Volunteer not found",
    });

    expect(findApplicationsMock).not.toHaveBeenCalled();
  });

  it("returns approved past volunteer experiences successfully", async () => {
    const volunteer = createVolunteer();

    const pastApplication = {
      _id: "application-1",
      volunteerId: "507f1f77bcf86cd799439011",
      status: "approved",
      opportunityId: {
        _id: "opportunity-1",
        title: "Beach Cleanup",
      },
    };

    const currentApplication = {
      _id: "application-2",
      volunteerId: "507f1f77bcf86cd799439011",
      status: "approved",
      opportunityId: null,
    };

    findVolunteerByIdMock.mockReturnValue(
      createFindByIdChain(volunteer),
    );

    findApplicationsMock.mockReturnValue({
      populate: vi.fn().mockResolvedValue([
        pastApplication,
        currentApplication,
      ]),
    });

    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
    };
    const res = createResponse();

    await getVolunteerPastExperience(req, res);

    expect(findApplicationsMock).toHaveBeenCalledWith({
      volunteerId: "507f1f77bcf86cd799439011",
      status: "approved",
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      volunteerId: "507f1f77bcf86cd799439011",
      count: 1,
      data: [pastApplication],
    });
  });

  it("returns 500 when retrieving past experience fails", async () => {
    findVolunteerByIdMock.mockReturnValue(
      createFindByIdChain(
        createVolunteer(),
      ),
    );

    findApplicationsMock.mockReturnValue({
      populate: vi
        .fn()
        .mockRejectedValue(new Error("Database error")),
    });

    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
    };
    const res = createResponse();

    await getVolunteerPastExperience(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Database error",
    });
  });
});

