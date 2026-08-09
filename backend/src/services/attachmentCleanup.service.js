import AttachmentCleanupJob from "../models/attachmentCleanupJob.model.js";
import { deleteMessageAttachmentFromCloudinary } from "./cloudinary.service.js";

const getRetryDelayMs = (attempts) =>
  Math.min(60 * 60 * 1000, 30 * 1000 * 2 ** Math.min(attempts, 7));

export const queueAttachmentCleanup = async (attachments = []) => {
  const uniqueAttachments = [
    ...new Map(
      attachments
        .filter((attachment) => attachment?.publicId)
        .map((attachment) => [attachment.publicId, attachment]),
    ).values(),
  ];

  await Promise.all(
    uniqueAttachments.map((attachment) =>
      AttachmentCleanupJob.updateOne(
        { publicId: attachment.publicId },
        {
          $setOnInsert: {
            publicId: attachment.publicId,
            resourceType: attachment.resourceType,
            nextAttemptAt: new Date(),
          },
        },
        { upsert: true },
      ),
    ),
  );
};

export const processAttachmentCleanupJobs = async ({
  limit = 25,
  now = new Date(),
} = {}) => {
  const jobs = await AttachmentCleanupJob.find({
    nextAttemptAt: { $lte: now },
  })
    .sort({ nextAttemptAt: 1 })
    .limit(limit);

  const results = await Promise.allSettled(
    jobs.map(async (job) => {
      try {
        await deleteMessageAttachmentFromCloudinary(job);
        await AttachmentCleanupJob.deleteOne({ _id: job._id });
        return { publicId: job.publicId, success: true };
      } catch (error) {
        const attempts = job.attempts + 1;
        await AttachmentCleanupJob.updateOne(
          { _id: job._id },
          {
            $set: {
              attempts,
              lastError: error.message,
              nextAttemptAt: new Date(now.getTime() + getRetryDelayMs(attempts)),
            },
          },
        );
        throw error;
      }
    }),
  );

  return results;
};

export const cleanupUploadedAttachment = async (attachment) => {
  if (!attachment?.publicId) {
    return;
  }

  try {
    await deleteMessageAttachmentFromCloudinary(attachment);
  } catch {
    await queueAttachmentCleanup([attachment]);
  }
};
