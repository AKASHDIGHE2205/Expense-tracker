import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createCategory, getAllCategories, getSingleCategory } from "../controller/categoryController.js";

const router = express.Router();

router.post("/add", authMiddleware, createCategory);
router.get("/all", authMiddleware, getAllCategories);
router.get("/:id", authMiddleware, getSingleCategory);

export default router;