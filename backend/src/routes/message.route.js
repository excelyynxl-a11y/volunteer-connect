import express from "express";
import {
  createOrGetConversation,
  getConversationMessages,
  getMyConversations,
  markConversationAsRead,
  sendMessage,
} from "../controllers/message.controller.js";
import { allowRoles, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute, allowRoles("volunteer", "organisation"));

router.get("/conversations", getMyConversations);
router.post("/conversations", createOrGetConversation);
router.get(
  "/conversations/:conversationId/messages",
  getConversationMessages,
);
router.post("/conversations/:conversationId/messages", sendMessage);
router.patch("/conversations/:conversationId/read", markConversationAsRead);

export default router;
