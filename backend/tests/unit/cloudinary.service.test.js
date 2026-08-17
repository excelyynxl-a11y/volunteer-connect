import { beforeEach, describe, expect, it, vi } from "vitest";

const { cloudinaryUrl } = vi.hoisted(() => ({
  cloudinaryUrl: vi.fn(),
}));

vi.mock("../../src/lib/cloudinary.js", () => ({
  default: {
    url: cloudinaryUrl,
  },
}));

import { getMessageAttachmentDownloadUrl } from "../../src/services/cloudinary.service.js";

describe("message attachment Cloudinary delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cloudinaryUrl.mockReturnValue("https://example.test/attachment");
  });

  it("uses the attachment flag without parsing the file extension as a flag", () => {
    const url = getMessageAttachmentDownloadUrl({
      fileName: "event-guide.png",
      publicId: "message-attachments/event-guide",
      resourceType: "image",
    });

    expect(url).toBe("https://example.test/attachment");
    expect(cloudinaryUrl).toHaveBeenCalledWith(
      "message-attachments/event-guide",
      {
        flags: "attachment",
        resource_type: "image",
        secure: true,
        type: "upload",
      },
    );
  });
});
