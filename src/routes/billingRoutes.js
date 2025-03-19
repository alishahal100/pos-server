import express from "express";
import {
  createInvoice,
  getInvoices,
  updatePaymentStatus,
} from "../controllers/billingController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/invoice", authMiddleware, createInvoice);
router.get("/get/invoice", authMiddleware, getInvoices);
router.put("/:id", authMiddleware, updatePaymentStatus);

export default router;
