import mongoose from "mongoose";

const tranSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
    },
    transactionType: {
      type: String, // Cr, Dr
    },
    status : {
      type: Boolean,
      default: true
    },
    c_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    u_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }

  },
  { timestamps: true, }
);

const Transaction = mongoose.model("Transaction", tranSchema);

export default Transaction;