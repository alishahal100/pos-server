import express from "express";
import { registerUser, loginUser,getUser } from "../controllers/authController.js";
import protect from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getUser);

export default router;
