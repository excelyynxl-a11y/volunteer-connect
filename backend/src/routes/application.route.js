import express from "express";
import {
  approveApplication,
  createApplication,
  deleteApplication,
  getAllApplications,
  getApplicationById,
  getMyApplications,
  getMyOrganisationApplications,
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
  "/organisation/me",
  allowRoles("organisation"),
  getMyOrganisationApplications,
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
  allowRoles("organisation"),
  approveApplication,
);
router.patch(
  "/:id/reject",
  allowRoles("organisation"),
  rejectApplication,
);
router.patch(
  "/:id/withdraw",
  allowRoles("volunteer"),
  withdrawApplication,
);
export default router;
