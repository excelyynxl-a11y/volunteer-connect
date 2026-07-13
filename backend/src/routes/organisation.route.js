import express from "express";
import {
  getOrgProfile,
  updateOrgProfile,
} from "../controllers/organisation.controller.js";
import { allowRoles, protectRoute } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/profile/:id", getOrgProfile);

router.put(
  "/profile",
  allowRoles("organisation"),
  uploadAvatar,
  updateOrgProfile,
);

export default router;
