// instructor.controller.js

import { Course } from "../model/course.model.js";
import { Transaction } from "../model/transaction.model.js";
import { Learner } from "../model/learner.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Get all courses created by instructor + earnings per course
export const getMyCoursesWithStats = asyncHandler(async (req, res) => {
    const instructorId = req.user._id;

    const courses = await Course.find({ instructor: instructorId })
        .select("title price createdAt");

    const coursesWithStats = await Promise.all(
        courses.map(async (course) => {

            // Now no pending — only completed transactions matter
            const completed = await Transaction.countDocuments({
                course_id: course._id,
                status: "COMPLETED"
            });

            const earnings = course.price * 0.8 * completed;

            return {
                courseId: course._id,
                title: course.title,
                price: course.price,
                studentsEnrolled: completed,
                earningsFromThisCourse: earnings
            };
        })
    );

    const totalEarnings = coursesWithStats.reduce((sum, c) => sum + c.earningsFromThisCourse, 0);

    res.json(new ApiResponse(200, {
        courses: coursesWithStats,
        totalEarnings
    }));
});


// 2. Get approved students for a specific course
export const getApproveStudents = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const instructorId = req.user._id;

    const course = await Course.findOne({ _id: courseId, instructor: instructorId });
    if (!course) throw new ApiError(403, "Not your course");

    const pending = await Transaction.find({
        course_id: courseId,
        status: "COMPLETED"
    })
    .populate({
        path: "from_user",
        select: "userName fullName bank_account_number",
        model: "User"
    });
    res.json(new ApiResponse(200, pending));
});




// 3. Get Full Details of a Specific Course (For Instructor Dashboard)
export const getMyCourseDetails = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const instructorId = req.user._id;

    // Find course + verify ownership
    const course = await Course.findOne({ 
        _id: courseId, 
        instructor: instructorId 
    });

    if (!course) {
        throw new ApiError(404, "Course not found or you are not the owner");
    }

    // Count enrolled students
    const totalEnrolled = await Transaction.countDocuments({
        course_id: course._id,
        status: "COMPLETED"
    });

    // Calculate instructor earnings (80%)
    const instructorEarnings = course.price * 0.8 * totalEnrolled;

    // Final response with full details
    const courseDetails = {
        courseId: course._id,
        title: course.title,
        description: course.description,
        price: course.price,
        lumpSumPayment: course.lumpSumPayment,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        totalEnrolled,
        instructorEarnings,
        totalVideos: course.videos.length,
        totalResources: course.resources.length,
        videos: course.videos.map(video => ({
            videoId: video._id,
            title: video.title,
            url: video.url,
            duration_seconds: video.duration_seconds
        })),
        resources: course.resources.map(res => ({
            resourceId: res._id,
            title: res.title,
            mediaType: res.mediaType,
            url: res.url
        }))
    };

    return res.status(200).json(
        new ApiResponse(200, courseDetails, "Course details fetched successfully")
    );
});

