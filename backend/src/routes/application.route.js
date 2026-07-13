import express from "express";
import {
  approveApplication,
  completeApplication,
  createApplication,
  deleteApplication,
  getAllApplications,
  getApplicationById,
  getMyApplications,
  getOpportunityApplications,
  rejectApplication,
  withdrawApplication,
} from "../controllers/application.controller.js";
import {
  adminOnly,
  allowRoles,
  protectRoute,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminOnly, getAllApplications);
router.get(
  "/me",
  protectRoute,
  allowRoles("volunteer"),
  getMyApplications,
);
router.get(
  "/opportunity/:opportunityId",
  protectRoute,
  allowRoles("organisation", "admin"),
  getOpportunityApplications,
);
router.post(
  "/create",
  protectRoute,
  allowRoles("volunteer"),
  createApplication,
);
router.get("/:id", protectRoute, getApplicationById);
router.delete("/:id", protectRoute, adminOnly, deleteApplication);
router.patch(
  "/:id/approve",
  protectRoute,
  allowRoles("organisation", "admin"),
  approveApplication,
);
router.patch(
  "/:id/reject",
  protectRoute,
  allowRoles("organisation", "admin"),
  rejectApplication,
);
router.patch(
  "/:id/withdraw",
  protectRoute,
  allowRoles("volunteer"),
  withdrawApplication,
);
router.patch("/:id/complete", protectRoute, completeApplication);


export default router;
