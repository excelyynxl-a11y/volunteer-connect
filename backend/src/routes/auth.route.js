import express from "express";
import { checkAuth, getMe, login, logout, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { uploadResume } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post('/signup', uploadResume, signup);
router.get('/me', protectRoute, getMe);
router.post('/login', login);
router.post("/logout", logout);
router.get("/check", protectRoute, checkAuth);

export default router; 
