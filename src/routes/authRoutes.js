import express from "express";
import { registerUser, loginUser,getUser,updatePassword,updateUser } from "../controllers/authController.js";
import protect from "../middlewares/authMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/",authMiddleware, getUser);

router.put("/update", authMiddleware, updateUser);
router.put("/update-password", authMiddleware, updatePassword);

export default router;
