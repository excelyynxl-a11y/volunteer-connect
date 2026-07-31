import mongoose from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/models/conversation.model.js", () => ({
  default: {
    create: vi.fn(),
    deleteOne: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock("../../src/models/message.model.js", () => ({
  default: {
    create: vi.fn(),
    deleteOne: vi.fn(),
    deleteMany: vi.fn(),
    findOne: vi.fn(),
  },
}));

vi.mock("../../src/models/user.model.js", () => ({
  Organisation: {
    findOne: vi.fn(),
  },
}));

vi.mock("../../src/services/conversation.service.js", () => ({
  deleteConversationPermanently: vi.fn(),
  deleteExpiredConversations: vi.fn(),
  isConversationParticipant: vi.fn(),
}));

vi.mock("../../src/services/attachmentCleanup.service.js", () => ({
  cleanupUploadedAttachment: vi.fn(),
}));

vi.mock("../../src/services/cloudinary.service.js", () => ({
  getMessageAttachmentDownloadUrl: vi.fn(),
  uploadMessageAttachmentToCloudinary: vi.fn(),
}));

vi.mock("../../src/events/message.events.js", () => ({
  emitConversationCreated: vi.fn(),
  emitConversationDeleted: vi.fn(),
  emitMessageCreated: vi.fn(),
}));

vi.mock("../../src/services/conversationExpiry.service.js", () => ({
  cancelConversationExpiry: vi.fn(),
  scheduleConversationExpiry: vi.fn(),
}));

import {
  endConversation,
  initiateConversation,
  sendMessage,
} from "../../src/controllers/message.controller.js";
import {
  emitConversationCreated,
  emitConversationDeleted,
  emitMessageCreated,
} from "../../src/events/message.events.js";
import Conversation from "../../src/models/conversation.model.js";
import Message from "../../src/models/message.model.js";
import { Organisation } from "../../src/models/user.model.js";
import { uploadMessageAttachmentToCloudinary } from "../../src/services/cloudinary.service.js";
import {
  deleteConversationPermanently,
  isConversationParticipant,
} from "../../src/services/conversation.service.js";
import {
  cancelConversationExpiry,
  scheduleConversationExpiry,
} from "../../src/services/conversationExpiry.service.js";

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

const createUser = (role) => ({
  _id: new mongoose.Types.ObjectId(),
  role,
});

describe("message controller lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isConversationParticipant.mockReturnValue(true);
  });

  it("prevents an organisation from initiating a conversation", async () => {
    const response = createResponse();

    await initiateConversation(
      {
        body: {},
        user: createUser("organisation"),
      },
      response,
    );

    expect(response.statusCode).toBe(403);
    expect(Conversation.create).not.toHaveBeenCalled();
  });

  it("creates the conversation together with the volunteer's first message", async () => {
    const volunteer = createUser("volunteer");
    const organisationId = new mongoose.Types.ObjectId();
    const conversationId = new mongoose.Types.ObjectId();
    const createdAt = new Date("2026-07-31T01:00:00.000Z");
    const conversation = {
      _id: conversationId,
      lastMessageAt: null,
      save: vi.fn().mockResolvedValue(),
    };
    const message = {
      _id: new mongoose.Types.ObjectId(),
      conversationId,
      senderId: volunteer._id,
      content: "Hello",
      createdAt,
    };
    Organisation.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({ _id: organisationId }),
    });
    Conversation.findOne.mockResolvedValue(null);
    Conversation.create.mockResolvedValue(conversation);
    Message.create.mockResolvedValue(message);
    const response = createResponse();

    await initiateConversation(
      {
        body: {
          organisationId: String(organisationId),
          content: "  Hello  ",
        },
        user: volunteer,
      },
      response,
    );

    expect(Conversation.create).toHaveBeenCalledWith({
      volunteerId: volunteer._id,
      organisationId,
    });
    expect(Message.create).toHaveBeenCalledWith({
      attachment: null,
      conversationId,
      senderId: volunteer._id,
      content: "Hello",
    });
    expect(conversation.lastMessageAt).toEqual(createdAt);
    expect(emitConversationCreated).toHaveBeenCalledWith({
      conversation,
      message: expect.objectContaining({
        _id: message._id,
        content: "Hello",
      }),
      responseDeadline: null,
    });
    expect(response.statusCode).toBe(201);
  });

  it("accepts an attachment-only message and applies organisation timing", async () => {
    const organisation = createUser("organisation");
    const sentAt = new Date("2026-07-31T01:00:00.000Z");
    const attachment = {
      fileName: "event-guide.pdf",
      publicId: "message-attachments/event-guide.pdf",
      resourceType: "raw",
      mimeType: "application/pdf",
      size: 2048,
    };
    const conversation = {
      _id: new mongoose.Types.ObjectId(),
      deletionStartedAt: null,
      organisationId: organisation._id,
      responseDeadline: null,
      save: vi.fn().mockResolvedValue(),
    };
    Conversation.findById.mockResolvedValue(conversation);
    uploadMessageAttachmentToCloudinary.mockResolvedValue(attachment);
    Message.create.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      attachment,
      content: "",
      createdAt: sentAt,
    });
    const response = createResponse();

    await sendMessage(
      {
        body: {},
        file: {
          originalname: "event-guide.pdf",
        },
        params: { conversationId: String(conversation._id) },
        user: organisation,
      },
      response,
    );

    expect(Message.create).toHaveBeenCalledWith({
      attachment,
      content: "",
      conversationId: conversation._id,
      senderId: organisation._id,
    });
    expect(conversation.responseDeadline.toISOString()).toBe(
      "2026-07-31T04:00:00.000Z",
    );
    expect(scheduleConversationExpiry).toHaveBeenCalledWith(
      conversation._id,
      conversation.responseDeadline,
    );
    expect(emitMessageCreated).toHaveBeenCalled();
    expect(response.statusCode).toBe(201);
  });

  it("starts a new three-hour deadline from the latest organisation message", async () => {
    const organisation = createUser("organisation");
    const sentAt = new Date("2026-07-31T01:00:00.000Z");
    const conversation = {
      _id: new mongoose.Types.ObjectId(),
      deletionStartedAt: null,
      organisationId: organisation._id,
      responseDeadline: null,
      save: vi.fn().mockResolvedValue(),
    };
    Conversation.findById.mockResolvedValue(conversation);
    Message.create.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      createdAt: sentAt,
    });
    const response = createResponse();

    await sendMessage(
      {
        body: { content: "Organisation response" },
        params: { conversationId: String(conversation._id) },
        user: organisation,
      },
      response,
    );

    expect(conversation.responseDeadline.toISOString()).toBe(
      "2026-07-31T04:00:00.000Z",
    );
    expect(response.statusCode).toBe(201);
  });

  it("clears the deadline after a volunteer reply", async () => {
    const volunteer = createUser("volunteer");
    const conversation = {
      _id: new mongoose.Types.ObjectId(),
      deletionStartedAt: null,
      responseDeadline: new Date("2099-07-31T04:00:00.000Z"),
      volunteerId: volunteer._id,
      save: vi.fn().mockResolvedValue(),
    };
    Conversation.findById.mockResolvedValue(conversation);
    Message.create.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date("2099-07-31T02:00:00.000Z"),
    });
    const response = createResponse();

    await sendMessage(
      {
        body: { content: "Volunteer reply" },
        params: { conversationId: String(conversation._id) },
        user: volunteer,
      },
      response,
    );

    expect(conversation.responseDeadline).toBeNull();
    expect(cancelConversationExpiry).toHaveBeenCalledWith(conversation._id);
    expect(response.statusCode).toBe(201);
  });

  it("allows only the participating organisation to end a conversation", async () => {
    const organisation = createUser("organisation");
    const conversation = {
      _id: new mongoose.Types.ObjectId(),
      deletionStartedAt: null,
      organisationId: organisation._id,
    };
    Conversation.findById.mockResolvedValue(conversation);
    deleteConversationPermanently.mockResolvedValue({});
    const response = createResponse();

    await endConversation(
      {
        params: { conversationId: String(conversation._id) },
        user: organisation,
      },
      response,
    );

    expect(deleteConversationPermanently).toHaveBeenCalledWith(
      conversation._id,
      "ended_by_organisation",
    );
    expect(cancelConversationExpiry).toHaveBeenCalledWith(conversation._id);
    expect(emitConversationDeleted).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
  });
});
