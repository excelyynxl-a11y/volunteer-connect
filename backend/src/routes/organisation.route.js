import express from "express";
import { updateOrgProfile } from "../controllers/organisation.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.put("/profile", protectRoute, uploadAvatar, updateOrgProfile);

export default router;