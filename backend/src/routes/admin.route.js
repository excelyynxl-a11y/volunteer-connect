import express from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  approveUserAccount,
  rejectUserAccount,
  updateAdminProfile,
} from "../controllers/admin.controller.js";

const router = express.Router();

// User management
router.patch("/users/:id/approve", protectRoute, adminOnly, approveUserAccount);
router.patch("/users/:id/reject", protectRoute, adminOnly, rejectUserAccount);

// Admin management 
router.put("/profle", protectRoute, adminOnly, updateAdminProfile); // TODO: add uploadAvatar from multer.middleware when available 
// eg: router.put("/profile", protectRoute, adminOnly, uploadAvatar, updateAdminProfile);

export default router;
