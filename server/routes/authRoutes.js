import express from "express";
import { registerUser, loginUser, resetPassword, getUserProfile } from "../controller/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.get("/user-details", authMiddleware, getUserProfile);

export default router;