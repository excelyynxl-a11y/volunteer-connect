import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getVolunteers, getVolunteerProfile, updateVolunteerProfile, getVolunteerPastExperience } from "../controllers/volunteer.controller.js";
import { uploadAvatar } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Volunteer management

// Get all volunteers (Admin only)
router.get("/", getVolunteers);

// Get volunteer profile
router.get("/profile/:id", getVolunteerProfile);

// Update volunteer profile
router.put("/profile/:id", protectRoute, uploadAvatar, updateVolunteerProfile);

// Get volunteer past experience
router.get("/profile/:id/past-experience", getVolunteerPastExperience);


export default router;
