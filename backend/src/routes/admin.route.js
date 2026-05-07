import express from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import { approveUserAccount, deleteUser, getAllUsers, getUserById } from "../controllers/admin.controller.js";

const router = express.Router();

// User management
router.get("/users", getAllUsers);   
router.delete('/users/:id', protectRoute, adminOnly, deleteUser);
router.get('/users/:id', protectRoute, getUserById);
router.patch('/users/:id/approve', protectRoute, adminOnly, approveUserAccount);


export default router;