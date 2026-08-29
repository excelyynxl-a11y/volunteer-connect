import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isValidObjectId: vi.fn(),
  uploadAvatar: vi.fn(),
  parseArrayField: vi.fn(),
  normalizeSkills: vi.fn(),
  normalizeAvailability: vi.fn(),
  getAvailabilityValidationError: vi.fn(),
  sortAvailability: vi.fn(),
}));

vi.mock("mongoose", () => ({
  default: { Types: { ObjectId: { isValid: mocks.isValidObjectId } } },
}));
vi.mock("../../src/models/user.model.js", () => ({
  Volunteer: { findOne: vi.fn() },
}));
vi.mock("../../src/models/application.model.js", () => ({
  default: { find: vi.fn(), findOne: vi.fn(), exists: vi.fn() },
}));
vi.mock("../../src/models/opportunity.model.js", () => ({
  default: { find: vi.fn() },
}));
vi.mock("../../src/services/cloudinary.service.js", () => ({
  uploadAvatarToCloudinary: mocks.uploadAvatar,
}));
vi.mock("../../src/lib/volunteer.js", () => ({
  normalizeSkills: mocks.normalizeSkills,
  parseArrayField: mocks.parseArrayField,
  validAgeGroups: ["21-30", "31-40", "41-50", "51-60", "60+"],
}));
vi.mock("../../src/lib/availability.js", () => ({
  getAvailabilityValidationError: mocks.getAvailabilityValidationError,
  normalizeAvailability: mocks.normalizeAvailability,
  sortAvailability: mocks.sortAvailability,
}));

import Application from "../../src/models/application.model.js";
import Opportunity from "../../src/models/opportunity.model.js";
import { Volunteer } from "../../src/models/user.model.js";
import {
  getVolunteerPastExperience,
  getVolunteerProfile,
  updateVolunteerProfile,
} from "../../src/controllers/volunteer.controller.js";

const volunteerId = "507f191e810c19729de860e1";
const organisationId = "507f191e810c19729de860e2";

const createResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const selectQuery = (value) => ({ select: vi.fn().mockResolvedValue(value) });
const createVolunteer = (overrides = {}) => ({
  _id: volunteerId,
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
  mocks.isValidObjectId.mockReturnValue(true);
  mocks.parseArrayField.mockImplementation((value) => value);
  mocks.normalizeSkills.mockImplementation((value) => value);
  mocks.normalizeAvailability.mockImplementation((value) => value);
  mocks.getAvailabilityValidationError.mockReturnValue("");
  mocks.sortAvailability.mockImplementation((value) => value);
  mocks.uploadAvatar.mockResolvedValue("uploaded-avatar.jpg");
});

describe("volunteer profile controller", () => {
  it("rejects invalid and missing profile IDs", async () => {
    mocks.isValidObjectId.mockReturnValue(false);
    const invalidRes = createResponse();
    await getVolunteerProfile({ params: { id: "invalid" }, user: { _id: volunteerId, role: "volunteer" } }, invalidRes);
    expect(invalidRes.status).toHaveBeenCalledWith(400);

    mocks.isValidObjectId.mockReturnValue(true);
    Volunteer.findOne.mockReturnValue(selectQuery(null));
    const missingRes = createResponse();
    await getVolunteerProfile({ params: { id: volunteerId }, user: { _id: volunteerId, role: "volunteer" } }, missingRes);
    expect(Volunteer.findOne).toHaveBeenCalledWith({ _id: volunteerId, deletedAt: null });
    expect(missingRes.status).toHaveBeenCalledWith(404);
  });

  it("returns a volunteer's own profile with private fields", async () => {
    const volunteer = createVolunteer();
    const query = selectQuery(volunteer);
    Volunteer.findOne.mockReturnValue(query);
    const res = createResponse();

    await getVolunteerProfile({ params: { id: volunteerId }, user: { _id: volunteerId, role: "volunteer" } }, res);

    expect(query.select).toHaveBeenCalledWith(
      "_id name email avatar ageGroup resume biodata skills availability approvalStatus",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: volunteer });
  });

  it("requires an organisation connection and hides private fields", async () => {
    const opportunityQuery = selectQuery([{ _id: "opportunity-1" }]);
    Opportunity.find.mockReturnValue(opportunityQuery);
    Application.exists.mockResolvedValue(true);
    const profileQuery = selectQuery(createVolunteer());
    Volunteer.findOne.mockReturnValue(profileQuery);
    const res = createResponse();

    await getVolunteerProfile({
      params: { id: volunteerId },
      user: { _id: organisationId, role: "organisation" },
    }, res);

    expect(Opportunity.find).toHaveBeenCalledWith({ organisationId });
    expect(Application.exists).toHaveBeenCalledWith({
      volunteerId,
      opportunityId: { $in: ["opportunity-1"] },
      status: { $in: ["pending", "approved"] },
    });
    expect(profileQuery.select).toHaveBeenCalledWith(
      "_id name avatar ageGroup resume biodata skills availability",
    );
    expect(res.status).toHaveBeenCalledWith(200);

    Application.exists.mockResolvedValue(false);
    const forbidden = createResponse();
    await getVolunteerProfile({
      params: { id: volunteerId },
      user: { _id: organisationId, role: "organisation" },
    }, forbidden);
    expect(forbidden.status).toHaveBeenCalledWith(403);
  });

  it("validates ownership and profile input before saving", async () => {
    const otherRes = createResponse();
    await updateVolunteerProfile({
      params: { id: volunteerId },
      user: { _id: organisationId },
      body: { fullName: "Alex" },
    }, otherRes);
    expect(otherRes.status).toHaveBeenCalledWith(403);

    for (const body of [{}, { fullName: " " }, { ageGroup: "18-20" }, { biodata: "x".repeat(1001) }]) {
      const res = createResponse();
      await updateVolunteerProfile({
        params: { id: volunteerId },
        user: { _id: volunteerId },
        body,
      }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    }
    expect(Volunteer.findOne).not.toHaveBeenCalled();
  });

  it("updates allowed fields, normalises availability, and returns the saved profile", async () => {
    const volunteer = createVolunteer();
    const updated = { ...volunteer, name: "Jane Doe", skills: ["React"], availability: [{ dayOfWeek: "Monday" }] };
    Volunteer.findOne.mockReturnValueOnce(Promise.resolve(volunteer)).mockReturnValueOnce(selectQuery(updated));
    mocks.parseArrayField.mockImplementation((value) => value);
    mocks.normalizeSkills.mockReturnValue(["React"]);
    mocks.normalizeAvailability.mockReturnValue([{ dayOfWeek: "Monday" }]);
    mocks.sortAvailability.mockReturnValue(updated.availability);
    const res = createResponse();

    await updateVolunteerProfile({
      params: { id: volunteerId },
      user: { _id: volunteerId },
      body: {
        fullName: " Jane Doe ",
        skills: ["React"],
        availability: [{ dayOfWeek: "Monday" }],
      },
    }, res);

    expect(volunteer.name).toBe("Jane Doe");
    expect(volunteer.skills).toEqual(["React"]);
    expect(volunteer.availability).toEqual(updated.availability);
    expect(volunteer.save).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("rejects malformed availability and supports avatar upload failures", async () => {
    mocks.parseArrayField.mockReturnValue([{ dayOfWeek: "Monday" }]);
    mocks.normalizeAvailability.mockReturnValue([{ dayOfWeek: "Monday" }]);
    mocks.getAvailabilityValidationError.mockReturnValue("Invalid availability");
    const invalidRes = createResponse();
    await updateVolunteerProfile({
      params: { id: volunteerId },
      user: { _id: volunteerId },
      body: { availability: [{ dayOfWeek: "Monday" }] },
    }, invalidRes);
    expect(invalidRes.status).toHaveBeenCalledWith(400);

    mocks.getAvailabilityValidationError.mockReturnValue("");
    const volunteer = createVolunteer();
    Volunteer.findOne.mockReturnValueOnce(Promise.resolve(volunteer));
    mocks.uploadAvatar.mockRejectedValue(new Error("Avatar upload failed"));
    const uploadRes = createResponse();
    await updateVolunteerProfile({
      params: { id: volunteerId },
      user: { _id: volunteerId },
      body: {},
      file: { buffer: Buffer.from("avatar") },
    }, uploadRes);
    expect(uploadRes.status).toHaveBeenCalledWith(500);
    expect(volunteer.save).not.toHaveBeenCalled();
  });
});

describe("getVolunteerPastExperience", () => {
  it("returns only approved applications whose opportunities have ended", async () => {
    const volunteer = createVolunteer();
    Volunteer.findOne.mockReturnValue(selectQuery(volunteer));
    const past = { _id: "application-1", status: "approved", opportunityId: { _id: "opportunity-1" } };
    const current = { _id: "application-2", status: "approved", opportunityId: null };
    const populate = vi.fn().mockResolvedValue([past, current]);
    Application.find.mockReturnValue({ populate });
    const res = createResponse();

    await getVolunteerPastExperience({
      params: { id: volunteerId },
      user: { _id: volunteerId, role: "volunteer" },
    }, res);

    expect(Application.find).toHaveBeenCalledWith({ volunteerId, status: "approved" });
    expect(populate).toHaveBeenCalledWith(expect.objectContaining({
      path: "opportunityId",
      match: { endAt: { $lt: expect.any(Date) } },
    }));
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      volunteerId,
      count: 1,
      data: [past],
    });
  });
});
