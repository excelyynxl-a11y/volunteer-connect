import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/models/attachmentCleanupJob.model.js", () => ({
  default: {
    deleteOne: vi.fn(),
    find: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock("../../src/services/cloudinary.service.js", () => ({
  deleteMessageAttachmentFromCloudinary: vi.fn(),
}));

import AttachmentCleanupJob from "../../src/models/attachmentCleanupJob.model.js";
import {
  processAttachmentCleanupJobs,
  queueAttachmentCleanup,
} from "../../src/services/attachmentCleanup.service.js";
import { deleteMessageAttachmentFromCloudinary } from "../../src/services/cloudinary.service.js";

const mockCleanupJobs = (jobs) => {
  AttachmentCleanupJob.find.mockReturnValue({
    sort: vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue(jobs),
    }),
  });
};

describe("attachment cleanup queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queues each Cloudinary public ID only once", async () => {
    const attachment = {
      publicId: "message-attachments/file.pdf",
      resourceType: "raw",
    };
    AttachmentCleanupJob.updateOne.mockResolvedValue({});

    await queueAttachmentCleanup([attachment, attachment]);

    expect(AttachmentCleanupJob.updateOne).toHaveBeenCalledTimes(1);
    expect(AttachmentCleanupJob.updateOne).toHaveBeenCalledWith(
      { publicId: attachment.publicId },
      {
        $setOnInsert: {
          nextAttemptAt: expect.any(Date),
          publicId: attachment.publicId,
          resourceType: "raw",
        },
      },
      { upsert: true },
    );
  });

  it("removes a cleanup job after Cloudinary deletion succeeds", async () => {
    const job = {
      _id: "cleanup-job-1",
      attempts: 0,
      publicId: "message-attachments/photo",
      resourceType: "image",
    };
    mockCleanupJobs([job]);
    deleteMessageAttachmentFromCloudinary.mockResolvedValue({
      result: "ok",
    });
    AttachmentCleanupJob.deleteOne.mockResolvedValue({});

    const results = await processAttachmentCleanupJobs();

    expect(deleteMessageAttachmentFromCloudinary).toHaveBeenCalledWith(job);
    expect(AttachmentCleanupJob.deleteOne).toHaveBeenCalledWith({
      _id: job._id,
    });
    expect(results[0].status).toBe("fulfilled");
  });

  it("retains a failed job with a later retry time", async () => {
    const now = new Date("2026-07-31T01:00:00.000Z");
    const job = {
      _id: "cleanup-job-2",
      attempts: 0,
      publicId: "message-attachments/photo",
      resourceType: "image",
    };
    mockCleanupJobs([job]);
    deleteMessageAttachmentFromCloudinary.mockRejectedValue(
      new Error("Cloudinary unavailable"),
    );
    AttachmentCleanupJob.updateOne.mockResolvedValue({});

    const results = await processAttachmentCleanupJobs({ now });

    expect(AttachmentCleanupJob.updateOne).toHaveBeenCalledWith(
      { _id: job._id },
      {
        $set: {
          attempts: 1,
          lastError: "Cloudinary unavailable",
          nextAttemptAt: expect.any(Date),
        },
      },
    );
    expect(results[0].status).toBe("rejected");
  });
});
