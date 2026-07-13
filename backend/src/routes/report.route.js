import express from "express";
import { createReport, deleteReport, getAllReports, getReportById, updateReportStatus } from "../controllers/report.controller.js";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", adminOnly, getAllReports);
router.get("/:id", adminOnly, getReportById);
router.delete("/:id", adminOnly, deleteReport);
router.post("/", createReport); // TODO
router.patch("/:id", adminOnly, updateReportStatus); // TODO

export default router;
