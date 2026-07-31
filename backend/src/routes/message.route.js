import express from "express";
import {
  endConversation,
  getConversationMessages,
  getMyConversations,
  initiateConversation,
  markConversationAsRead,
  sendMessage,
} from "../controllers/message.controller.js";
import { allowRoles, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute, allowRoles("volunteer", "organisation"));

router.get("/conversations", getMyConversations);
router.post(
  "/conversations",
  allowRoles("volunteer"),
  initiateConversation,
);
router.get(
  "/conversations/:conversationId/messages",
  getConversationMessages,
);
router.post("/conversations/:conversationId/messages", sendMessage);
router.patch("/conversations/:conversationId/read", markConversationAsRead);
router.delete(
  "/conversations/:conversationId",
  allowRoles("organisation"),
  endConversation,
);

export default router;
