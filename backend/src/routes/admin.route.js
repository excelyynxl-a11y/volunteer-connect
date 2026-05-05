import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { approveUserAccount, deleteUser, getAllUsers, getUserById } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getAllUsers);   
router.delete('/users/:id', protectRoute, deleteUser);
router.get('/users/:id', protectRoute, getUserById);
router.patch('/users/:id/approve', protectRoute, approveUserAccount);

export default router;