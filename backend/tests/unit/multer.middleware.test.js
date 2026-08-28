import { describe, expect, it, vi } from "vitest";
import {
  uploadAvatar,
  uploadMessageAttachment,
  uploadResume,
  validateMessageAttachmentSignature,
} from "../../src/middlewares/multer.middleware.js";

vi.mock("multer", () => {
  class MulterError extends Error {
    constructor(code, field) {
      super(code);
      this.code = code;
      this.field = field;
    }
  }

  const multerMock = (options) => ({
    single: () => (req, res, cb) => {
      if (!req.file) return cb(null);

      if (options.limits?.fileSize && req.file.size > options.limits.fileSize) {
        const err = new MulterError("LIMIT_FILE_SIZE");
        return cb(err);
      }

      if (options.fileFilter) {
        options.fileFilter(req, req.file, (err, accepted) => {
          if (err) return cb(err);
          if (!accepted) return cb(new Error("File rejected"));
          cb(null);
        });
      } else {
        cb(null);
      }
    },
  });

  multerMock.memoryStorage = () => {};
  multerMock.MulterError = MulterError;

  return {
    default: multerMock,
    ...multerMock,
  };
});

const createResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const runMiddleware = (middleware, file) => {
  const req = {
    file,
    headers: {},
  };

  const res = createResponse();
  const next = vi.fn();

  middleware(req, res, next);

  return { req, res, next };
};

describe("uploadResume", () => {
  it("accepts a PDF resume", () => {
    const file = {
      fieldname: "resume",
      originalname: "resume.pdf",
      mimetype: "application/pdf",
      buffer: Buffer.from("PDF content"),
      size: 1024,
    };

    const { req, res, next } = runMiddleware(uploadResume, file);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.file).toBeDefined();
    expect(req.file.originalname).toBe("resume.pdf");
  });

  it("rejects a non-PDF resume", () => {
    const file = {
      fieldname: "resume",
      originalname: "resume.jpg",
      mimetype: "image/jpeg",
      buffer: Buffer.from("image content"),
      size: 1024,
    };

    const { res, next } = runMiddleware(uploadResume, file);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Only PDF files are allowed for resume uploads.",
    });
  });

  it("rejects a resume larger than 5MB", () => {
    const file = {
      fieldname: "resume",
      originalname: "large-resume.pdf",
      mimetype: "application/pdf",
      buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
      size: 5 * 1024 * 1024 + 1,
    };

    const { res, next } = runMiddleware(uploadResume, file);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Resume must be 5MB or smaller.",
    });
  });
});

describe("uploadAvatar", () => {
  it("accepts a PNG avatar", () => {
    const file = {
      fieldname: "profilePic",
      originalname: "avatar.png",
      mimetype: "image/png",
      buffer: Buffer.from("PNG content"),
      size: 1024,
    };

    const { req, res, next } = runMiddleware(uploadAvatar, file);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.file).toBeDefined();
    expect(req.file.originalname).toBe("avatar.png");
  });

  it("accepts a JPEG avatar", () => {
    const file = {
      fieldname: "profilePic",
      originalname: "avatar.jpeg",
      mimetype: "image/jpeg",
      buffer: Buffer.from("JPEG content"),
      size: 1024,
    };

    const { req, res, next } = runMiddleware(uploadAvatar, file);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.file).toBeDefined();
  });

  it("accepts a JPG avatar", () => {
    const file = {
      fieldname: "profilePic",
      originalname: "avatar.jpg",
      mimetype: "image/jpg",
      buffer: Buffer.from("JPG content"),
      size: 1024,
    };

    const { req, res, next } = runMiddleware(uploadAvatar, file);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.file).toBeDefined();
  });

  it("rejects an unsupported avatar file type", () => {
    const file = {
      fieldname: "profilePic",
      originalname: "avatar.gif",
      mimetype: "image/gif",
      buffer: Buffer.from("GIF content"),
      size: 1024,
    };

    const { res, next } = runMiddleware(uploadAvatar, file);

    expect(next).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message:
        "Only PNG, JPEG, and JPG files are allowed for avatar uploads.",
    });
  });

  it("rejects an avatar larger than 5MB", () => {
    const file = {
      fieldname: "profilePic",
      originalname: "large-avatar.png",
      mimetype: "image/png",
      buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
      size: 5 * 1024 * 1024 + 1,
    };

    const { res, next } = runMiddleware(uploadAvatar, file);

    expect(next).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Avatar must be 5MB or smaller.",
    });
  });
});

describe("remaining upload middleware coverage", () => {
  it("accepts one allowed message attachment at or below 5MB", () => {
    const file = {
      fieldname: "attachment",
      originalname: "evidence.pdf",
      mimetype: "application/pdf",
      buffer: Buffer.from("%PDF-test content"),
      size: 5 * 1024 * 1024,
    };

    const upload = runMiddleware(uploadMessageAttachment, file);
    expect(upload.next).toHaveBeenCalledOnce();
    expect(upload.res.status).not.toHaveBeenCalled();

    const signatureNext = vi.fn();
    validateMessageAttachmentSignature(upload.req, createResponse(), signatureNext);
    expect(signatureNext).toHaveBeenCalledOnce();
  });

  it("rejects an attachment whose content signature does not match its type", () => {
    const req = {
      file: {
        originalname: "evidence.pdf",
        mimetype: "application/pdf",
        buffer: Buffer.from("not a PDF"),
      },
    };
    const res = createResponse();
    const next = vi.fn();

    validateMessageAttachmentSignature(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Message attachment content does not match its file type.",
    });
  });

  it("calls next exactly once when an optional upload is not supplied", () => {
    const upload = runMiddleware(uploadMessageAttachment);
    expect(upload.next).toHaveBeenCalledOnce();

    const signatureNext = vi.fn();
    validateMessageAttachmentSignature(upload.req, createResponse(), signatureNext);
    expect(signatureNext).toHaveBeenCalledOnce();
  });
});


