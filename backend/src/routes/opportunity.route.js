import express from "express";
import { 
  createOpportunity, 
  deleteOpportunity, 
  getAllOpportunities, 
  getOpportunityById, 
  updateOpportunity,
  getOrganisationOpportunities
} from "../controllers/opportunity.controller.js";
import { allowRoles, adminOnly, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllOpportunities);

router.get(
  "/my-opportunities",
  protectRoute,
  allowRoles("organisation"),
  getOrganisationOpportunities,
);

router.get("/:id", getOpportunityById);
router.delete("/:id", protectRoute, adminOnly, deleteOpportunity);
router.put(
  "/:id",
  protectRoute,
  allowRoles("organisation", "admin"),
  updateOpportunity,
);
router.post(
  "/create",
  protectRoute,
  allowRoles("organisation"),
  createOpportunity,
);

export default router;
