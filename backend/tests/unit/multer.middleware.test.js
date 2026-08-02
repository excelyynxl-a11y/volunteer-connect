import { describe, expect, it, vi } from "vitest";
import { uploadResume, uploadAvatar } from "../../src/middlewares/multer.middleware.js";
import multer from "multer";

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

