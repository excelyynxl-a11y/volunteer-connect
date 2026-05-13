import express from "express";
import { updateOrgProfile, getOrgPublicProfile } from "../controllers/organisation.controller.js";
import {protectRoute} from "../middlewares/auth.middleware.js"

const router = express.Router();

router.get("/:id", getOrgPublicProfile)

router.put("/profile", protectRoute, updateOrgProfile)

export default router;