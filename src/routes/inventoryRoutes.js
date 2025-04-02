import express from "express";
import {
  getAllInventory,
  addInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();

// Routes
router.get("/", authMiddleware, getAllInventory);
router.post("/", authMiddleware, addInventory);
router.get("/:id", authMiddleware, getInventoryById);
router.put("/:id", authMiddleware, updateInventory);
router.delete("/:id", authMiddleware, deleteInventory);

export default router;
