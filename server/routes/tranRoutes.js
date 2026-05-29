import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addExpenses, getAllTransactions, getRecentTransactions, getTransactionSummary, getTranDetails, updateTransaction, deleteTransaction, getExportData } from "../controller/tranController.js";


const router = express.Router();

router.post("/add-expenses", authMiddleware, addExpenses)
router.get("/recent", authMiddleware, getRecentTransactions);
router.get("/all", authMiddleware, getAllTransactions);
router.get("/details/:id", authMiddleware, getTranDetails);
router.get("/summary", authMiddleware, getTransactionSummary);
router.put("/update", authMiddleware, updateTransaction);
router.delete("/delete/:id", authMiddleware, deleteTransaction);
router.get("/export", authMiddleware, getExportData);

export default router;