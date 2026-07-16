import express from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  approveUserAccount,
  rejectUserAccount,
  updateAdminProfile,
} from "../controllers/admin.controller.js";
import { uploadAvatar } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.use(protectRoute, adminOnly);

// User management
router.patch("/users/:id/approve", approveUserAccount);
router.patch("/users/:id/reject", rejectUserAccount);

// Admin management 
router.put("/profile", uploadAvatar, updateAdminProfile);

export default router;
