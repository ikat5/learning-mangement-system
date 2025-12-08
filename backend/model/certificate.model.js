import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
    serialNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    learner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    pdfUrl: {
        type: String // Optional if we decide to cache it later
    },
    isRevoked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Certificate = mongoose.model("Certificate", certificateSchema);
