import { describe, expect, it } from "vitest";

import {
  getAttachmentResourceType,
  getSafeDownloadName,
  hasValidMessageAttachmentSignature,
  isAllowedMessageAttachment,
  MESSAGE_ATTACHMENT_MAX_BYTES,
} from "../../src/lib/messageAttachment.js";

describe("message attachment rules", () => {
  it("allows only the agreed PDF, JPEG, JPG, and PNG combinations", () => {
    expect(
      isAllowedMessageAttachment("guide.pdf", "application/pdf"),
    ).toBe(true);
    expect(isAllowedMessageAttachment("photo.jpg", "image/jpeg")).toBe(true);
    expect(isAllowedMessageAttachment("photo.JPEG", "image/jpeg")).toBe(true);
    expect(isAllowedMessageAttachment("photo.png", "image/png")).toBe(true);

    expect(isAllowedMessageAttachment("photo.webp", "image/webp")).toBe(false);
    expect(isAllowedMessageAttachment("guide.pdf", "image/png")).toBe(false);
    expect(isAllowedMessageAttachment("photo.png", "application/pdf")).toBe(
      false,
    );
  });

  it("uses the confirmed five-megabyte limit", () => {
    expect(MESSAGE_ATTACHMENT_MAX_BYTES).toBe(5 * 1024 * 1024);
  });

  it("routes PDFs through raw storage and images through image storage", () => {
    expect(getAttachmentResourceType("application/pdf")).toBe("raw");
    expect(getAttachmentResourceType("image/jpeg")).toBe("image");
  });

  it("checks the uploaded file signature instead of trusting metadata alone", () => {
    expect(
      hasValidMessageAttachmentSignature({
        buffer: Buffer.from("%PDF-1.7"),
        mimetype: "application/pdf",
      }),
    ).toBe(true);
    expect(
      hasValidMessageAttachmentSignature({
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
        mimetype: "image/jpeg",
      }),
    ).toBe(true);
    expect(
      hasValidMessageAttachmentSignature({
        buffer: Buffer.from([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        ]),
        mimetype: "image/png",
      }),
    ).toBe(true);
    expect(
      hasValidMessageAttachmentSignature({
        buffer: Buffer.from("<script>alert(1)</script>"),
        mimetype: "image/png",
      }),
    ).toBe(false);
  });

  it("sanitizes the download name without retaining path segments", () => {
    expect(getSafeDownloadName("../../Event Guide (Final).pdf")).toBe(
      "Event_Guide_Final_.pdf",
    );
  });
});
