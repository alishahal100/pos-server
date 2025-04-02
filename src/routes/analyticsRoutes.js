// routes/analyticsRoutes.js
import express from "express";
import { 
  getSalesAnalytics,
  getInventoryAnalytics,
  getSalesGrowth
} from "../controllers/analyticsController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/sales", authMiddleware, getSalesAnalytics);
router.get("/inventory", authMiddleware, getInventoryAnalytics);
router.get("/growth", authMiddleware, getSalesGrowth);

export default router;