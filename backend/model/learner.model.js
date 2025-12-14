import mongoose from "mongoose";
import { User } from "./user.model.js";
import { Course } from "./course.model.js";

// --- NEW SUB-SCHEMA FOR WATCH HISTORY ---
const watchHistoryItemSchema = new mongoose.Schema({
    material_id: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the specific video/material
    last_watched_time: { type: Number, default: 0 }, // Timestamp in seconds of last viewing position
    completed: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
}, { _id: false }); // Do not create an _id for subdocuments
// --- MODIFIED LEARNER SCHEMA ---
const learnerSchema = new mongoose.Schema({
    // Inherited fields from User: fullName, email, bank_account_number, etc.
    
    courses_enrolled: [{
        _id: false,
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        enrollment_date: { type: Date, default: Date.now },
        
        // Tracking fields for the course overall:
        status: { type: String, default: "Pending", enum: ["Pending", "InProgress", "Completed"] },
        progress_percentage: { type: Number, default: 0, min: 0, max: 100 },
        
        // NEW FIELD: Array to track individual video/material progress
        watch_history: [watchHistoryItemSchema]
    }],
    
    certificates_earned: [{ type: String }] // Stores unique certificate IDs/URLs
}, { timestamps: true });

// Check if discriminator already exists to prevent duplicate registration
let Learner;
try {
  Learner = mongoose.model("Learner");
} catch (error) {
  Learner = User.discriminator("Learner", learnerSchema);
}

export { Learner };