import express from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import { deleteUser, getAllUsers, getUserById } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/users", getAllUsers);   
router.get('/users/:id', protectRoute, getUserById);
router.delete('/users/:id', protectRoute, adminOnly, deleteUser);

export default router;