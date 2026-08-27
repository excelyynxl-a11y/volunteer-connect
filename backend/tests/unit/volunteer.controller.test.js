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

  it("returns only the intended volunteer profile fields", async () => {
    const selectMock = vi.fn().mockResolvedValue(createVolunteer());

    findVolunteerByIdMock.mockReturnValue({
      select: selectMock,
    });

    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
    };
    const res = createResponse();

    await getVolunteerProfile(req, res);

    expect(selectMock).toHaveBeenCalledWith(
      "name email avatar ageGroup resume biodata skills availability approvalStatus",
    );
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

  it("rejects biodata longer than 1000 characters", async () => {
    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      user: { _id: "507f1f77bcf86cd799439011" },
      body: { biodata: "a".repeat(1001) },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Biodata must be a string with at most 1000 characters",
    });
    expect(findVolunteerByIdMock).not.toHaveBeenCalled();
  });

  it("rejects an empty full name", async () => {
    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      user: { _id: "507f1f77bcf86cd799439011" },
      body: { fullName: "   " },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Full name cannot be empty",
    });
    expect(findVolunteerByIdMock).not.toHaveBeenCalled();
  });

  it("rejects a non-string biodata", async () => {
    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      user: { _id: "507f1f77bcf86cd799439011" },
      body: { biodata: { text: "Invalid biodata" } },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Biodata must be a string with at most 1000 characters",
    });
    expect(findVolunteerByIdMock).not.toHaveBeenCalled();
  });

  it("accepts biodata containing exactly 1000 characters", async () => {
    const biodata = "a".repeat(1000);
    const volunteer = createVolunteer();
    const updatedVolunteer = {
      ...volunteer,
      biodata,
    };

    findVolunteerByIdMock
      .mockReturnValueOnce(Promise.resolve(volunteer))
      .mockReturnValueOnce(createFindByIdChain(updatedVolunteer));

    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      user: { _id: "507f1f77bcf86cd799439011" },
      body: { biodata },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(volunteer.biodata).toBe(biodata);
    expect(volunteer.save).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Volunteer profile updated successfully",
      data: updatedVolunteer,
    });
  });

  it("rejects skills that cannot be parsed as an array", async () => {
    parseArrayFieldMock.mockReturnValue("React");

    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      user: { _id: "507f1f77bcf86cd799439011" },
      body: { skills: "React" },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Skills must be an array",
    });
    expect(normalizeSkillsMock).not.toHaveBeenCalled();
    expect(findVolunteerByIdMock).not.toHaveBeenCalled();
  });

  it("rejects more than 20 skills", async () => {
    const parsedSkills = Array.from(
      { length: 21 },
      (_, index) => `Skill ${index + 1}`,
    );

    parseArrayFieldMock.mockReturnValue(parsedSkills);
    normalizeSkillsMock.mockReturnValue(parsedSkills);

    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      user: { _id: "507f1f77bcf86cd799439011" },
      body: { skills: parsedSkills },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(normalizeSkillsMock).toHaveBeenCalledWith(parsedSkills);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "A volunteer can have at most 20 skills",
    });
    expect(findVolunteerByIdMock).not.toHaveBeenCalled();
  });

  it("rejects a skill longer than 50 characters", async () => {
    const parsedSkills = ["a".repeat(51)];

    parseArrayFieldMock.mockReturnValue(parsedSkills);
    normalizeSkillsMock.mockReturnValue(parsedSkills);

    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      user: { _id: "507f1f77bcf86cd799439011" },
      body: { skills: parsedSkills },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(normalizeSkillsMock).toHaveBeenCalledWith(parsedSkills);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Each skill must be at most 50 characters",
    });
    expect(findVolunteerByIdMock).not.toHaveBeenCalled();
  });

  it("parses and stores normalised skills", async () => {
    const volunteer = createVolunteer();
    const parsedSkills = [" React ", "React", "Node"];
    const normalizedSkills = ["React", "Node"];

    parseArrayFieldMock.mockReturnValue(parsedSkills);
    normalizeSkillsMock.mockReturnValue(normalizedSkills);

    findVolunteerByIdMock
      .mockReturnValueOnce(Promise.resolve(volunteer))
      .mockReturnValueOnce(createFindByIdChain(volunteer));

    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      user: { _id: "507f1f77bcf86cd799439011" },
      body: { skills: '[" React ","React","Node"]' },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(parseArrayFieldMock).toHaveBeenCalledWith(
      '[" React ","React","Node"]',
    );
    expect(normalizeSkillsMock).toHaveBeenCalledWith(parsedSkills);
    expect(volunteer.skills).toEqual(["React", "Node"]);
    expect(volunteer.save).toHaveBeenCalled();
  });

  it("normalises, validates, and sorts availability slots", async () => {
    const volunteer = createVolunteer();

    const rawAvailability = JSON.stringify([
      {
        dayOfWeek: " Wednesday ",
        startTime: " 14:00 ",
        endTime: " 16:00 ",
      },
      {
        dayOfWeek: " Monday ",
        startTime: " 09:00 ",
        endTime: " 11:00 ",
        preference: " preferred ",
      },
    ]);

    const parsedAvailability = [
      {
        dayOfWeek: " Wednesday ",
        startTime: " 14:00 ",
        endTime: " 16:00 ",
      },
      {
        dayOfWeek: " Monday ",
        startTime: " 09:00 ",
        endTime: " 11:00 ",
        preference: " preferred ",
      },
    ];

    const normalizedAvailability = [
      {
        dayOfWeek: "Wednesday",
        startTime: "14:00",
        endTime: "16:00",
        preference: "available",
      },
      {
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "11:00",
        preference: "preferred",
      },
    ];

    const sortedAvailability = [
      normalizedAvailability[1],
      normalizedAvailability[0],
    ];

    const updatedVolunteer = {
      ...volunteer,
      availability: sortedAvailability,
    };

    parseArrayFieldMock.mockReturnValue(parsedAvailability);
    normalizeAvailabilityMock.mockReturnValue(normalizedAvailability);
    getAvailabilityValidationErrorMock.mockReturnValue("");
    sortAvailabilityMock.mockReturnValue(sortedAvailability);

    findVolunteerByIdMock
      .mockReturnValueOnce(Promise.resolve(volunteer))
      .mockReturnValueOnce(createFindByIdChain(updatedVolunteer));

    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
      user: {
        _id: "507f1f77bcf86cd799439011",
      },
      body: {
        availability: rawAvailability,
      },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(parseArrayFieldMock).toHaveBeenCalledWith(rawAvailability);

    expect(normalizeAvailabilityMock).toHaveBeenCalledWith(
      parsedAvailability,
    );

    expect(getAvailabilityValidationErrorMock).toHaveBeenCalledWith(
      normalizedAvailability,
    );

    expect(sortAvailabilityMock).toHaveBeenCalledWith(
      normalizedAvailability,
    );

    expect(volunteer.availability).toEqual(sortedAvailability);
    expect(volunteer.save).toHaveBeenCalledOnce();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Volunteer profile updated successfully",
      data: updatedVolunteer,
    });
  });

  it("rejects invalid availability slots", async () => {
    const parsedAvailability = [
      {
        dayOfWeek: "Monday",
        startTime: "14:00",
        endTime: "10:00",
        preference: "available",
      },
    ];

    const normalizedAvailability = [...parsedAvailability];

    parseArrayFieldMock.mockReturnValue(parsedAvailability);
    normalizeAvailabilityMock.mockReturnValue(normalizedAvailability);
    getAvailabilityValidationErrorMock.mockReturnValue(
      "Each availability slot must include a valid dayOfWeek, startTime, endTime, and preference",
    );

    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
      user: {
        _id: "507f1f77bcf86cd799439011",
      },
      body: {
        availability: parsedAvailability,
      },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(getAvailabilityValidationErrorMock).toHaveBeenCalledWith(
      normalizedAvailability,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message:
        "Each availability slot must include a valid dayOfWeek, startTime, endTime, and preference",
    });

    expect(findVolunteerByIdMock).not.toHaveBeenCalled();
    expect(sortAvailabilityMock).not.toHaveBeenCalled();
  });

  it("uploads an avatar through the Cloudinary service boundary", async () => {
    const volunteer = createVolunteer({
      avatar: "old-avatar.jpg",
    });

    const avatarBuffer = Buffer.from("fake-avatar-content");
    const uploadedAvatarUrl =
      "https://res.cloudinary.com/test/image/upload/avatar.jpg";

    const updatedVolunteer = {
      ...volunteer,
      avatar: uploadedAvatarUrl,
    };

    uploadAvatarMock.mockResolvedValue(uploadedAvatarUrl);

    findVolunteerByIdMock
      .mockReturnValueOnce(Promise.resolve(volunteer))
      .mockReturnValueOnce(createFindByIdChain(updatedVolunteer));

    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
      user: {
        _id: "507f1f77bcf86cd799439011",
      },
      body: {},
      file: {
        buffer: avatarBuffer,
        mimetype: "image/jpeg",
        originalname: "avatar.jpg",
      },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(uploadAvatarMock).toHaveBeenCalledOnce();
    expect(uploadAvatarMock).toHaveBeenCalledWith(avatarBuffer);

    expect(volunteer.avatar).toBe(uploadedAvatarUrl);
    expect(volunteer.save).toHaveBeenCalledOnce();

    expect(findVolunteerByIdMock).toHaveBeenNthCalledWith(
      1,
      "507f1f77bcf86cd799439011",
    );
    expect(findVolunteerByIdMock).toHaveBeenNthCalledWith(
      2,
      "507f1f77bcf86cd799439011",
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Volunteer profile updated successfully",
      data: updatedVolunteer,
    });
  });

  it("returns 500 when avatar upload fails", async () => {
    const volunteer = createVolunteer();
    const avatarBuffer = Buffer.from("fake-avatar-content");

    uploadAvatarMock.mockRejectedValue(
      new Error("Avatar upload failed"),
    );

    findVolunteerByIdMock.mockReturnValueOnce(
      Promise.resolve(volunteer),
    );

    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
      user: {
        _id: "507f1f77bcf86cd799439011",
      },
      body: {},
      file: {
        buffer: avatarBuffer,
        mimetype: "image/jpeg",
        originalname: "avatar.jpg",
      },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(uploadAvatarMock).toHaveBeenCalledOnce();
    expect(uploadAvatarMock).toHaveBeenCalledWith(avatarBuffer);

    expect(volunteer.save).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Avatar upload failed",
    });
  });

  it("returns 500 when volunteer profile persistence fails", async () => {
    const volunteer = createVolunteer({
      save: vi.fn().mockRejectedValue(
        new Error("Profile persistence failed"),
      ),
    });

    findVolunteerByIdMock.mockReturnValueOnce(
      Promise.resolve(volunteer),
    );

    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
      },
      user: {
        _id: "507f1f77bcf86cd799439011",
      },
      body: {
        biodata: "Updated biodata",
      },
    };
    const res = createResponse();

    await updateVolunteerProfile(req, res);

    expect(volunteer.biodata).toBe("Updated biodata");
    expect(volunteer.save).toHaveBeenCalledOnce();

    // If saving fails, should not continue reading the updated Volunteer.
    expect(findVolunteerByIdMock).toHaveBeenCalledOnce();

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Profile persistence failed",
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

  it("does not describe scheduled duration as verified volunteer hours", async () => {
    const volunteerId = "507f1f77bcf86cd799439011";

    const volunteer = createVolunteer();

    const pastApplication = {
      _id: "application-1",
      volunteerId,
      status: "approved",
      opportunityId: {
        _id: "opportunity-1",
        title: "Beach Cleanup",
        startAt: new Date("2026-08-20T09:00:00.000Z"),
        endAt: new Date("2026-08-20T12:00:00.000Z"),
        organisationId: {
          _id: "organisation-1",
          name: "Community Organisation",
        },
      },
    };

    const populateMock = vi.fn().mockResolvedValue([
      pastApplication,
    ]);

    findVolunteerByIdMock.mockReturnValue(
      createFindByIdChain(volunteer),
    );

    findApplicationsMock.mockReturnValue({
      populate: populateMock,
    });

    const req = {
      params: {
        id: volunteerId,
      },
    };
    const res = createResponse();

    await getVolunteerPastExperience(req, res);

    expect(findApplicationsMock).toHaveBeenCalledWith({
      volunteerId,
      status: "approved",
    });

    expect(populateMock).toHaveBeenCalledWith({
      path: "opportunityId",
      match: {
        endAt: {
          $lt: expect.any(Date),
        },
      },
      populate: {
        path: "organisationId",
        select: "name",
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);

    const responseBody = res.json.mock.calls[0][0];

    expect(responseBody).toEqual({
      success: true,
      volunteerId,
      count: 1,
      data: [pastApplication],
    });

    // Scheduled opportunity time is not verified volunteer hours.
    expect(responseBody).not.toHaveProperty("verifiedHours");
    expect(responseBody).not.toHaveProperty("totalVolunteerHours");
    expect(responseBody.data[0]).not.toHaveProperty(
      "verifiedHours",
    );
    expect(responseBody.data[0].opportunityId).not.toHaveProperty(
      "verifiedHours",
    );
  });
});

