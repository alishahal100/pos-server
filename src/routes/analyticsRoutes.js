import express from "express";
import { getBestSellingProducts, getMonthlySales } from "../controllers/analyticsController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/best-sellers", authMiddleware, getBestSellingProducts);
router.get("/monthly-sales", authMiddleware, getMonthlySales);

export default router;
