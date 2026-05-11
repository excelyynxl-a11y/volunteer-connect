import express from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import { deleteUser, getAllAdmins, getAllOrganisations, getAllUsers, getAllVolunteers, getUserById } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getAllUsers);   
router.get("/volunteers", getAllVolunteers);               
router.get("/organisations", getAllOrganisations);         
router.get("/admins", getAllAdmins); 
router.get('/:id', protectRoute, getUserById);
router.delete('/:id', protectRoute, adminOnly, deleteUser); 

export default router;