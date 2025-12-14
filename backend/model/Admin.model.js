import mongoose from "mongoose";
import { User } from "./user.model.js";
import { Transaction } from "./transaction.model.js";

const adminSchema = new mongoose.Schema({
    supervised_learners: [{ type: mongoose.Schema.Types.ObjectId, ref: "Learner" }],
    supervised_instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Instructor" }],
    supervised_transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }]
}, { timestamps: true });

// Check if discriminator already exists to prevent duplicate registration
let Admin;
try {
  Admin = mongoose.model("Admin");
} catch (error) {
  Admin = User.discriminator("Admin", adminSchema);
}

export { Admin };
