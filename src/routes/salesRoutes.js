// routes/salesRoutes.js (Corrected)
import express from "express";
import { getSalesData } from "../controllers/salesController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Changed from /:range to / with query parameters
router.get("/", authMiddleware, getSalesData);

export default router;