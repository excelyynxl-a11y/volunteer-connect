import { emitConversationDeleted } from "../events/message.events.js";
import Conversation from "../models/conversation.model.js";
import { processAttachmentCleanupJobs } from "./attachmentCleanup.service.js";
import {
  clearAllConversationExpiryTimers,
  scheduleConversationExpiry,
} from "./conversationExpiry.service.js";
import {
  deleteExpiredConversations,
  retryPendingConversationDeletions,
} from "./conversation.service.js";

export const MESSAGING_MAINTENANCE_INTERVAL_MS = 30 * 1000;

let maintenanceTimer = null;
let maintenanceRunInProgress = false;

const emitDeletions = (deletions) => {
  deletions.forEach((deletion) => {
    emitConversationDeleted(deletion);
  });
};

export const runMessagingMaintenance = async (now = new Date()) => {
  if (maintenanceRunInProgress) {
    return { skipped: true };
  }

  maintenanceRunInProgress = true;

  try {
    const [expiredDeletions, retriedDeletions] = await Promise.all([
      deleteExpiredConversations(now),
      retryPendingConversationDeletions(),
    ]);

    emitDeletions(expiredDeletions);
    emitDeletions(retriedDeletions);
    await processAttachmentCleanupJobs({ now });

    return {
      skipped: false,
      deletedCount: expiredDeletions.length + retriedDeletions.length,
    };
  } finally {
    maintenanceRunInProgress = false;
  }
};

export const recoverConversationExpirySchedules = async (
  now = new Date(),
) => {
  await runMessagingMaintenance(now);

  const activeDeadlines = await Conversation.find({
    deletionStartedAt: null,
    responseDeadline: { $ne: null, $gt: now },
  }).select("_id responseDeadline");

  activeDeadlines.forEach((conversation) => {
    scheduleConversationExpiry(
      conversation._id,
      conversation.responseDeadline,
    );
  });

  return activeDeadlines.length;
};

export const startMessagingMaintenance = async () => {
  if (maintenanceTimer) {
    return;
  }

  await recoverConversationExpirySchedules();
  maintenanceTimer = setInterval(() => {
    void runMessagingMaintenance().catch((error) => {
      console.log("Error running messaging maintenance: ", error.message);
    });
  }, MESSAGING_MAINTENANCE_INTERVAL_MS);
  maintenanceTimer.unref?.();
};

export const stopMessagingMaintenance = () => {
  if (maintenanceTimer) {
    clearInterval(maintenanceTimer);
    maintenanceTimer = null;
  }

  clearAllConversationExpiryTimers();
};
