import express from "express";
import {
  getAllUsers,
  updateUserByAdmin,
  deleteUser,
} from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();


router.get("/", getAllUsers);
router.put("/:id", updateUserByAdmin);
router.delete("/:id", deleteUser);

export default router;
