import express from "express";
import { deleteApplication, getAllApplications, getApplicationById } from "../controllers/application.controller.js";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllApplications);
router.get("/:id", getApplicationById); 
router.delete("/:id", protectRoute, adminOnly, deleteApplication);

export default router;