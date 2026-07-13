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

router.use(protectRoute);

router.get("/", adminOnly, getAllApplications);
router.get(
  "/me",
  allowRoles("volunteer"),
  getMyApplications,
);
router.get(
  "/opportunity/:opportunityId",
  allowRoles("organisation", "admin"),
  getOpportunityApplications,
);
router.post(
  "/create",
  allowRoles("volunteer"),
  createApplication,
);
router.get("/:id", getApplicationById);
router.delete("/:id", adminOnly, deleteApplication);
router.patch(
  "/:id/approve",
  allowRoles("organisation", "admin"),
  approveApplication,
);
router.patch(
  "/:id/reject",
  allowRoles("organisation", "admin"),
  rejectApplication,
);
router.patch(
  "/:id/withdraw",
  allowRoles("volunteer"),
  withdrawApplication,
);
router.patch("/:id/complete", completeApplication);


export default router;
