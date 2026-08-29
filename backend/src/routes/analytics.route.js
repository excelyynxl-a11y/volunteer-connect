import express from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  getVolunteerSignUpAnalytics,
  getOrganisationSignUpAnalytics,
  getOpportunityCreatedAnalytics,
  getReportAnalytics,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.use(protectRoute, adminOnly);

router.get("/volunteer-signups", getVolunteerSignUpAnalytics);
router.get("/organisation-signups", getOrganisationSignUpAnalytics);
router.get("/opportunities-created", getOpportunityCreatedAnalytics);
router.get("/reports", getReportAnalytics);

export default router;
