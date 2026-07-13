import express from "express";
import { allowRoles, protectRoute } from "../middlewares/auth.middleware.js";
import {
  getVolunteerPastExperience,
  getVolunteerProfile,
  updateVolunteerProfile,
} from "../controllers/volunteer.controller.js";
import { uploadAvatar } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.use(protectRoute);

// Get volunteer profile
router.get("/profile/:id", getVolunteerProfile);

// Update volunteer profile
router.put(
  "/profile/:id",
  allowRoles("volunteer"),
  uploadAvatar,
  updateVolunteerProfile,
);

// Get volunteer past experience
router.get(
  "/profile/:id/past-experience",
  getVolunteerPastExperience,
);


export default router;
