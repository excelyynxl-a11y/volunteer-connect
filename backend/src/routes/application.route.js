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

// GET /api/application - Volunteer applications listing
router.get(
  "/",
  allowRoles("volunteer"),
  getMyApplications
);

// GET /api/application/all - Admin only view for all applications
router.get(
  "/all",
  adminOnly,
  getAllApplications
);

// GET /api/application/organisation - Organisation applications listing
router.get(
  "/organisation",
  allowRoles("organisation"),
  getMyOrganisationApplications
);

// POST /api/application - Submit a volunteer application
router.post(
  "/",
  allowRoles("volunteer"),
  createApplication
);

// GET /api/application/:id - Single application detail
router.get("/:id", getApplicationById);

// DELETE /api/application/:id - Admin delete route
router.delete("/:id", adminOnly, deleteApplication);

// PUT /api/application/:id/approve - Organisation approve
router.put(
  "/:id/approve",
  allowRoles("organisation"),
  approveApplication
);

// PUT /api/application/:id/reject - Organisation reject
router.put(
  "/:id/reject",
  allowRoles("organisation"),
  rejectApplication
);

// PUT /api/application/:id/withdraw - Volunteer withdraw
router.put(
  "/:id/withdraw",
  allowRoles("volunteer"),
  withdrawApplication
);

export default router;