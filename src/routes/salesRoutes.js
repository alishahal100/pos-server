import express from "express";
import { getSalesData } from "../controllers/salesController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/:range",authMiddleware , getSalesData);

export default router;
