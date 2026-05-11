import express from "express";
import { createReport, deleteReport, getAllReports, getReportById, updateReportStatus } from "../controllers/report.controller.js";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminOnly, getAllReports);
router.get("/:id", protectRoute, adminOnly, getReportById);
router.delete("/:id", protectRoute, adminOnly, deleteReport);
router.post("/", protectRoute, createReport); // TODO
router.patch("/:id", protectRoute, adminOnly, updateReportStatus); // TODO

export default router;