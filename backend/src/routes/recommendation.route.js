import express from "express";
import rateLimit from "express-rate-limit";
import {
  getMyAnalysis,
  recommendOpportunities,
} from "../controllers/recommendation.controller.js";
import { allowRoles, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

const recommendationRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  // Authentication runs before this limiter, so each volunteer has a separate quota.
  keyGenerator: (req) => String(req.user._id),
  message: {
    success: false,
    message: "Too many recommendation requests. Please try again later.",
  },
});

router.use(protectRoute, allowRoles("volunteer"));

// GET /api/recommendations/profile - Stored analysis of the volunteer's profile and resume
router.get("/profile", getMyAnalysis);

// POST /api/recommendations/opportunities - AI opportunity recommendations
router.post("/opportunities", recommendationRateLimiter, recommendOpportunities);

export default router;
