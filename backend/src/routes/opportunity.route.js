import express from "express";
import { deleteOpportunity, getAllOpportunities, getOpportunityById } from "../controllers/opportunity.controller.js";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllOpportunities);
router.get("/:id", getOpportunityById);
router.delete("/:id", protectRoute, adminOnly, deleteOpportunity);

export default router;