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

