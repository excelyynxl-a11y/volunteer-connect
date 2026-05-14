import express from "express";
import { updateOrgProfile } from "../controllers/organisation.controller.js";
import {protectRoute} from "../middlewares/auth.middleware.js"

const router = express.Router();

router.put("/profile", protectRoute, updateOrgProfile);

export default router;