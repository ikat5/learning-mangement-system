import mongoose from "mongoose";
import { User } from "./user.model.js"; // Ensure base User is imported
// import { Course } from "./course.model.js"; // Will be used when integrating

const instructorSchema = new mongoose.Schema({
    courses_taught: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    total_earnings: { type: Number, required: true, default: 0 }
}, { timestamps: true });

// Standardized export
export const Instructor = User.discriminator("Instructor", instructorSchema);