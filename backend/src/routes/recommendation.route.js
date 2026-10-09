import express from "express";
import {
  getMyAnalysis,
  recommendOpportunities,
} from "../controllers/recommendation.controller.js";
import { allowRoles, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute, allowRoles("volunteer"));

// GET /api/recommendations/profile - Stored analysis of the volunteer's profile and resume
router.get("/profile", getMyAnalysis);

// POST /api/recommendations/opportunities - AI opportunity recommendations
router.post("/opportunities", recommendOpportunities);

export default router;
