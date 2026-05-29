import Transaction from "../model/Transaction.js";
import { Parser } from "json2csv";


export const addExpenses = async (req, res) => {
  try {
    const { amount, transactionType, categoryId, notes, date, } = req.body;

    if (!amount || !date || !transactionType) {
      return res.status(400).json({
        success: false,
        message: "Amount, Date and Transaction Type are required",
      });
    }

    const expense = await Transaction.create({
      amount,
      categoryId,
      date,
      notes,
      transactionType,
      status: true,
      c_by: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Expense Added Successfully",
      data: expense,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* Get Recent Transactions (last 7 days) */
export const getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Date before 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const transactions = await Transaction.find({
      c_by: userId,
      date: { $gte: sevenDaysAgo },
      status: true
    })
      .populate("categoryId")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* Get All Transactions with Date Range and Type Filter */
export const getAllTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, fromDate, toDate } = req.query;

    // Base filter
    let filter = {
      c_by: userId,
      status: true
    };

    // Apply transaction type filter
    if (type !== "all" && ["Cr", "Dr"].includes(type)) {
      filter.transactionType = type;
    }

    // Apply date range filter
    if (fromDate || toDate) {
      filter.date = {};

      if (fromDate) {
        // Set to start of the day (00:00:00)
        const startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);
        filter.date.$gte = startDate;
      }

      if (toDate) {
        // Set to end of the day (23:59:59.999)
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

    const transactions = await Transaction.find(filter).populate("categoryId").sort({ date: -1 });

    // Calculate summary statistics
    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0
    };

    transactions.forEach(transaction => {
      if (transaction.transactionType === 'Cr') {
        summary.totalIncome += transaction.amount;
      } else if (transaction.transactionType === 'Dr') {
        summary.totalExpense += transaction.amount;
      }
    });

    summary.balance = summary.totalIncome - summary.totalExpense;

    res.status(200).json({
      success: true,
      count: transactions.length,
      type,
      fromDate: fromDate || null,
      toDate: toDate || null,
      summary,
      data: transactions
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Transaction summary
export const getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = "Month" } = req.query;

    const now = new Date();
    let startDate = new Date();

    // Determine date range
    switch (period.toLowerCase()) {
      case "day":
        startDate.setHours(0, 0, 0, 0);
        break;

      case "week":
        // Current week (Sunday → Saturday)
        const currentDay = now.getDay();
        startDate.setDate(now.getDate() - currentDay);
        startDate.setHours(0, 0, 0, 0);
        break;

      case "month":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(), 1
        );
        break;

      case "year":
        startDate = new Date(
          now.getFullYear(),
          0,
          1
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message:
            "Invalid period. Use Day, Week, Month, Year",
        });
    }

    // Fetch transactions
    const transactions = await Transaction.find({
      c_by: userId,
      date: { $gte: startDate, $lte: now },
      status: true
    });

    // Calculate totals
    let totalExpense = 0;
    let totalIncome = 0;

    transactions.forEach((item) => {
      if (item.transactionType === "Dr") {
        totalExpense += Number(item.amount);
      }

      if (item.transactionType === "Cr") {
        totalIncome += Number(item.amount);
      }
    });

    const currentBalance = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      period,
      data: {
        totalIncome,
        totalExpense,
        currentBalance
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTranDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const transaction = await Transaction.findOne({
      _id: id,
      c_by: userId,
      status: true
    }).populate("categoryId");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      id,
      amount,
      transactionType,
      categoryId,
      notes,
      date
    } = req.body;

    const transaction = await Transaction.findOne({
      _id: id,
      c_by: userId,
      status: true
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    // Update only if value is provided
    if (amount !== undefined)
      transaction.amount = amount;

    if (transactionType !== undefined)
      transaction.transactionType = transactionType;

    if (categoryId !== undefined)
      transaction.categoryId = categoryId;

    if (notes !== undefined)
      transaction.notes = notes;

    if (date !== undefined)
      transaction.date = date;

    await transaction.save();

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const transaction = await Transaction.findOne({
      _id: id,
      c_by: userId,
      status: true
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }
    // Soft delete by setting status to false
    transaction.status = false;
    await transaction.save();
    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getExportData = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({
      c_by: userId,
      status: true
    }).populate("categoryId").sort({ date: -1 });

    const fields = [
      { label: "Date", value: (row) => row.date.toISOString() },
      { label: "Amount", value: "amount" },
      { label: "Type", value: "transactionType" },
      { label: "Category", value: (row) => row.categoryId ? row.categoryId.name : "" },
      { label: "Notes", value: "notes" },
    ];
    const parser = new Parser({ fields });
    const csvData = parser.parse(transactions);
    res.header("Content-Type", "text/csv");
    res.attachment("transactions.csv");
    res.send(csvData);

  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}