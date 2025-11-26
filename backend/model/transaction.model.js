import mongoose from "mongoose";
import { randomUUID } from "crypto";

const transactionSchema = new mongoose.Schema({
    transaction_id: {
        type: String,
        unique: true,
        default: () => `TXN-${randomUUID()}`
    },
    type: { type: String, required: true, enum: ["PURCHASE", "LUMP_SUM", "COMMISSION_PAYOUT"] },
    amount: { type: Number, required: true },

    // Store both:
    // 1. user reference (for populate)
    // 2. bank number string (for bank logic)
    from_user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    from_account_number: { type: String, required: true },

    to_user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    to_account_number: { type: String, required: true },

    status: { type: String, required: true, enum: ["PENDING", "COMPLETED", "FAILED", "VALIDATED"], default: "PENDING" },

    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },

    timestamp: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

export const Transaction = mongoose.model("Transaction", transactionSchema);
