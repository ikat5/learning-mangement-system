import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },

    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
    lumpSumPayment: { type: Number, required: true, min: 0 },

    // Field 1: Videos (Content to be tracked)
    videos: [{
        // Note: Mongoose automatically adds an _id here, which is used as the material_id for tracking
        title: { type: String, required: true },
        url: { type: String, required: true }, // Cloudinary URL
        duration_seconds: { type: Number, required: true, min: 1 } // Crucial for calculating progress
    }],

    // Field 2: Resources (Untracked supporting links like images, drive links, PDFs, etc.)
    resources: [{
        title: { type: String, required: true },
        mediaType: { 
            type: String, 
            enum: ["image", "text", "mcq", "audio", "document_link"], // Added document_link for drive/external files
            required: true 
        }, 
        url: { type: String, required: true } // Cloudinary URL, Drive Link, etc.
    }],
}, { timestamps: true });

courseSchema.plugin(mongooseAggregatePaginate);

export const Course = mongoose.model("Course", courseSchema);