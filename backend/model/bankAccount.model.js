import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema({
    account_number: { type: String, required: true, unique: true },
    current_balance: { type: Number, required: true, default: 0 },
    // This key is used for authentication against the user-provided secret
    secret_key: { type: String, required: true } 
}, { timestamps: true });

// NOTE: You will need to seed this database with initial accounts 
// for the LMS, Instructors, and test Learners.
export const BankAccount = mongoose.model("BankAccount", bankAccountSchema);