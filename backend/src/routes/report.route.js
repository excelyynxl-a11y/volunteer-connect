import express from "express";
import {
  createReport,
  deleteReport,
  getAllReports,
  getReportById,
  getMyReports,
  updateReportStatus
} from "../controllers/report.controller.js";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/my-reports", getMyReports);
router.get("/", adminOnly, getAllReports);
router.get("/:id", adminOnly, getReportById);
router.delete("/:id", adminOnly, deleteReport);
router.post("/", createReport);
router.patch("/:id", adminOnly, updateReportStatus);

export default router;
