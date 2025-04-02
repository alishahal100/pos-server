import express from "express";
import { createCategory, getCategories,updateCategory } from "../controllers/categoryController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createCategory);
router.get("/", authMiddleware, getCategories);
// Update category route
router.put("/:id", authMiddleware, updateCategory);

export default router;
