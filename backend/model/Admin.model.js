import mongoose from "mongoose";
import { User } from "./user.model.js";
import { Transaction } from "./transaction.model.js"; // Added import

const adminSchema = new mongoose.Schema({
    // Admin does not need explicit supervision fields unless you use them for filtering.
    // Keeping fields you defined, assuming they track admin's oversight duties.
    supervised_learners: [{ type: mongoose.Schema.Types.ObjectId, ref: "Learner" }],
    supervised_instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Instructor" }],
    // Corrected to reference the Transaction model
    supervised_transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }]
}, { timestamps: true });

export const Admin = User.discriminator("Admin", adminSchema);

