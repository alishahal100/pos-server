import express from "express";
import { createCategory, getCategories } from "../controllers/categoryController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createCategory);
router.get("/", authMiddleware, getCategories);

export default router;
