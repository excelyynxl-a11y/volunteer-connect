import express from "express";
import { approveApplication, completeApplication, createApplication, deleteApplication, getAllApplications, getApplicationById, rejectApplication } from "../controllers/application.controller.js";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllApplications);
router.get("/:id", getApplicationById); 
router.delete("/:id", protectRoute, adminOnly, deleteApplication);
router.post("/create", protectRoute, createApplication);
router.patch("/:id/approve", protectRoute, approveApplication);
router.patch("/:id/reject", protectRoute, rejectApplication);
router.patch("/:id/complete", protectRoute, completeApplication);


export default router;