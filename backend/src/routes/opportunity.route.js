import express from "express";
import { createOpportunity, deleteOpportunity, getAllOpportunities, getOpportunityById, updateOpportunity } from "../controllers/opportunity.controller.js";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllOpportunities);
router.get("/:id", getOpportunityById);
router.delete("/:id", protectRoute, adminOnly, deleteOpportunity);
router.put("/:id", protectRoute, updateOpportunity);
router.post("/create", protectRoute, createOpportunity);

export default router;