import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true, unique: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: "Learner", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  courseTitle: { type: String, required: true },
  learnerName: { type: String, required: true },
  downloadPath: { type: String, required: true },
  filePath: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Certificate = mongoose.model("Certificate", certificateSchema);
