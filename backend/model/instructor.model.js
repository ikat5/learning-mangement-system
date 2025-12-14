import mongoose from "mongoose";
import { User } from "./user.model.js";

const instructorSchema = new mongoose.Schema({
    courses_taught: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    total_earnings: { type: Number, required: true, default: 0 }
}, { timestamps: true });

// Check if discriminator already exists to prevent duplicate registration
let Instructor;
try {
  Instructor = mongoose.model("Instructor");
} catch (error) {
  Instructor = User.discriminator("Instructor", instructorSchema);
}

export { Instructor };