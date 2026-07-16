import express from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import { deleteUser, getAllAdmins, getAllOrganisations, getAllUsers, getAllVolunteers, getUserById } from "../controllers/user.controller.js";

const router = express.Router();

router.use(protectRoute, adminOnly);

router.get("/", getAllUsers);   
router.get("/volunteers", getAllVolunteers);               
router.get("/organisations", getAllOrganisations);         
router.get("/admins", getAllAdmins); 
router.get('/:id', getUserById);
router.delete('/:id', deleteUser); 

export default router;
