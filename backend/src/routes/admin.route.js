import express from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  approveUserAccount,
  rejectUserAccount,
} from "../controllers/admin.controller.js";

const router = express.Router();

// User management
router.patch("/users/:id/approve", protectRoute, adminOnly, approveUserAccount);
router.patch("/users/:id/reject", protectRoute, adminOnly, rejectUserAccount);
export default router;
