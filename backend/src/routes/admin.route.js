import express from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  approveUserAccount,
  rejectUserAccount,
  updateAdminProfile,
} from "../controllers/admin.controller.js";
import { uploadAvatar } from "../middlewares/multer.middleware.js";

const router = express.Router();

// User management
router.patch("/users/:id/approve", protectRoute, adminOnly, approveUserAccount);
router.patch("/users/:id/reject", protectRoute, adminOnly, rejectUserAccount);

// Admin management 
router.put("/profile", protectRoute, adminOnly, uploadAvatar, updateAdminProfile);

export default router;
