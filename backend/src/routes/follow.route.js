import express from "express";
import {
  followOrganisation,
  getFollowStatus,
  getMyFollowedOrganisations,
  getOrganisationFollowers,
  unfollowOrganisation,
} from "../controllers/follow.controller.js";
import { allowRoles, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/me",
  protectRoute,
  allowRoles("volunteer"),
  getMyFollowedOrganisations,
);
router.get(
  "/organisations/:organisationId/status",
  protectRoute,
  allowRoles("volunteer"),
  getFollowStatus,
);
router.get(
  "/organisations/:organisationId/followers",
  protectRoute,
  allowRoles("organisation", "admin"),
  getOrganisationFollowers,
);
router.post(
  "/organisations/:organisationId",
  protectRoute,
  allowRoles("volunteer"),
  followOrganisation,
);
router.delete(
  "/organisations/:organisationId",
  protectRoute,
  allowRoles("volunteer"),
  unfollowOrganisation,
);

export default router;
