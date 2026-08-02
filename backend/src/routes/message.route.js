import express from "express";
import {
  downloadMessageAttachment,
  endConversation,
  getConversationMessages,
  getMyConversations,
  initiateConversation,
  markConversationAsRead,
  sendMessage,
} from "../controllers/message.controller.js";
import { allowRoles, protectRoute } from "../middlewares/auth.middleware.js";
import {
  uploadMessageAttachment,
  validateMessageAttachmentSignature,
} from "../middlewares/multer.middleware.js";

const router = express.Router();

router.use(protectRoute, allowRoles("volunteer", "organisation"));

router.get("/conversations", getMyConversations);
router.post(
  "/conversations",
  allowRoles("volunteer"),
  uploadMessageAttachment,
  validateMessageAttachmentSignature,
  initiateConversation,
);
router.get(
  "/conversations/:conversationId/messages",
  getConversationMessages,
);
router.post(
  "/conversations/:conversationId/messages",
  uploadMessageAttachment,
  validateMessageAttachmentSignature,
  sendMessage,
);
router.get(
  "/conversations/:conversationId/messages/:messageId/attachment",
  downloadMessageAttachment,
);
router.patch("/conversations/:conversationId/read", markConversationAsRead);
router.delete(
  "/conversations/:conversationId",
  allowRoles("organisation"),
  endConversation,
);

export default router;
