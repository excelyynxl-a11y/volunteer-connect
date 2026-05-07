import express from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import { approveUserAccount } from "../controllers/admin.controller.js";

const router = express.Router();

// User management
router.patch('/users/:id/approve', protectRoute, adminOnly, approveUserAccount);

export default router;