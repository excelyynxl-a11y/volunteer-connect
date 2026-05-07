import express from "express";
import { deleteOrganisation, getAllOrganisations, getOrganisationById } from "../controllers/organisation.controller.js";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllOrganisations);
router.get("/:id", getOrganisationById);
router.delete("/:id", protectRoute, adminOnly, deleteOrganisation);

export default router;