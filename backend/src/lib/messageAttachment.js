import path from "node:path";

export const MESSAGE_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_ATTACHMENT_TYPES = new Map([
  [".pdf", new Set(["application/pdf"])],
  [".jpg", new Set(["image/jpeg", "image/jpg"])],
  [".jpeg", new Set(["image/jpeg", "image/jpg"])],
  [".png", new Set(["image/png"])],
]);

export const isAllowedMessageAttachment = (fileName, mimeType) => {
  const extension = path.extname(fileName ?? "").toLowerCase();
  return Boolean(ALLOWED_ATTACHMENT_TYPES.get(extension)?.has(mimeType));
};

export const getAttachmentResourceType = (mimeType) =>
  mimeType === "application/pdf" ? "raw" : "image";

export const hasValidMessageAttachmentSignature = (file) => {
  if (!file?.buffer?.length) {
    return false;
  }

  if (file.mimetype === "application/pdf") {
    return file.buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  }

  if (file.mimetype === "image/png") {
    return file.buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    return file.buffer
      .subarray(0, 3)
      .equals(Buffer.from([0xff, 0xd8, 0xff]));
  }

  return false;
};

export const getSafeDownloadName = (fileName) => {
  const normalizedName = path.basename(fileName ?? "attachment");
  const safeName = normalizedName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return safeName.slice(0, 180) || "attachment";
};
