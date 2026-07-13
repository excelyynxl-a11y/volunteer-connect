import express from "express";
import {
  getOrgProfile,
  updateOrgProfile,
} from "../controllers/organisation.controller.js";
import { allowRoles, protectRoute } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.get("/profile/:id", protectRoute, getOrgProfile);

router.put(
  "/profile",
  protectRoute,
  allowRoles("organisation"),
  uploadAvatar,
  updateOrgProfile,
);

export default router;
