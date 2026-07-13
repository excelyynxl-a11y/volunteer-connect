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

router.use(protectRoute);

router.get(
  "/me",
  allowRoles("volunteer"),
  getMyFollowedOrganisations,
);
router.get(
  "/organisations/:organisationId/status",
  allowRoles("volunteer"),
  getFollowStatus,
);
router.get(
  "/organisations/:organisationId/followers",
  allowRoles("organisation", "admin"),
  getOrganisationFollowers,
);
router.post(
  "/organisations/:organisationId",
  allowRoles("volunteer"),
  followOrganisation,
);
router.delete(
  "/organisations/:organisationId",
  allowRoles("volunteer"),
  unfollowOrganisation,
);

export default router;
