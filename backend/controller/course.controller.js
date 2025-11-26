import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponce.js";
import { Course } from "../model/course.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { Instructor } from "../model/instructor.model.js";
import { Transaction } from "../model/transaction.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const createCourse = asyncHandler(async (req, res) => {
  const { title, description, price, lumpSumPayment } = req.body;
  const instructor = req.body.instructor || req.user._id; // assuming instructor can be sent or taken from logged-in user

  //Validate required text fields
  if ([title, description, price, lumpSumPayment].some(field => !field || field.toString().trim() === "")) {
    throw new ApiError(400, "Title, description, price, and lump sum payment are required");
  }

  // ========= FIELD 1: VIDEOS (Uploaded Files) =========
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "At least one video file is required");
  }

  // You should send video metadata from frontend like: videoTitles[], videoDurations[]
  // Example: req.body.videoTitles = ["Intro", "Lecture 1"]
  //          req.body.videoDurations = [120, 300]
   const videoTitles = typeof req.body.videoTitles === "string" ? JSON.parse(req.body.videoTitles) : req.body.videoTitles || [];
  const videoDurations = typeof req.body.videoDurations === "string" ? JSON.parse(req.body.videoDurations) : req.body.videoDurations || [];

  const uploadResults = await Promise.all(
    req.files.map(file => uploadCloudinary(file.path))
  );

  const videos = uploadResults.map((result, index) => ({
    title: videoTitles[index]?.trim() || `Video ${index + 1}`,
    url: result.secure_url,
    duration_seconds: parseInt(videoDurations[index]) || 60 // fallback
  }));

  // ========= FIELD 2: RESOURCES (PDFs, Links, MCQs, etc.) =========
  let resources = [];
  if (req.body.resources) {
    if (typeof req.body.resources === "string") {
      try {
        resources = JSON.parse(req.body.resources);
      } catch (err) {
        throw new ApiError(400, "Invalid resources format. Must be valid JSON array");
      }
    } else {
      resources = req.body.resources;
    }

    if (!Array.isArray(resources)) {
      throw new ApiError(400, "Resources must be provided as an array");
    }

    // Remove empty entries and validate the rest
    resources = resources
      .map((res) => ({
        title: res?.title?.trim(),
        mediaType: res?.mediaType?.trim(),
        url: res?.url?.trim(),
      }))
      .filter((res) => res.title || res.mediaType || res.url);

    resources.forEach((res, i) => {
      if (!res.title || !res.mediaType || !res.url) {
        throw new ApiError(400, `Resource ${i + 1}: title, mediaType, and url are required`);
      }
      if (!["image", "text", "mcq", "audio", "document_link"].includes(res.mediaType)) {
        throw new ApiError(400, `Invalid mediaType in resource ${i + 1}`);
      }
    });
  }

  // ========= CREATE COURSE =========
  const course = await Course.create({
    title,
    description,
    price: Number(price),
    lumpSumPayment: Number(lumpSumPayment),
    instructor,
    videos,           // ← Correct field name
    resources       // ← Properly parsed & validate
  });

  // Add course to Instructor's courses_taught
  await Instructor.findByIdAndUpdate(
    instructor,
    { $push: { courses_taught: course._id } },
    { new: true }
  );

  return res.status(201).json(
    new ApiResponse(201, course, "Course created successfully")
  );
});

// course.controller.js

const getAllCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find()
        .populate("instructor", "fullName userName")
        .select("title description price videos createdAt");

    const result = await Promise.all(
        courses.map(async (course) => {
            const enrolled = await Transaction.countDocuments({
                course_id: course._id,
                status: "COMPLETED"
            });

            return {
                _id: course._id,
                title: course.title,
                description: course.description,
                price: course.price,
                totalVideos: course.videos.length,
                enrolledStudents: enrolled,
                instructor: {
                    name: course.instructor.fullName,
                    username: course.instructor.userName
                },
                thumbnail: course.videos[0]?.url || null
            };
        })
    );

    res.json(new ApiResponse(200, result));
});



// ==================== ADD VIDEOS ONLY ====================
const addVideosToCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;

  const course = await Course.findOne({ _id: courseId, instructor: instructorId });
  if (!course) throw new ApiError(404, "Course not found or unauthorized");

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "Please upload at least one video");
  }

  const videoTitles = typeof req.body.videoTitles === "string" ? JSON.parse(req.body.videoTitles) : req.body.videoTitles || [];
  const videoDurations = typeof req.body.videoDurations === "string" ? JSON.parse(req.body.videoDurations) : req.body.videoDurations || [];

  const uploadResults = await Promise.all(req.files.map(file => uploadCloudinary(file.path)));

  const newVideos = uploadResults.map((result, i) => ({
    title: videoTitles[i]?.trim() || `New Lecture ${course.videos.length + i + 1}`,
    url: result.secure_url,
    duration_seconds: parseInt(videoDurations[i]) || 60
  }));

  course.videos.push(...newVideos);
  await course.save();

  return res.status(200).json(new ApiResponse(200, { added: newVideos.length, total: course.videos.length }, "Videos added successfully"));
});

// ==================== ADD RESOURCES ONLY ====================
const addResourcesToCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;

  const course = await Course.findOne({ _id: courseId, instructor: instructorId });
  if (!course) throw new ApiError(404, "Course not found or unauthorized");

  if (!req.body.resources) throw new ApiError(400, "resources field is required");

  let resources = typeof req.body.resources === "string" ? JSON.parse(req.body.resources) : req.body.resources;
  if (!Array.isArray(resources) || resources.length === 0) throw new ApiError(400, "resources must be non-empty array");

  resources.forEach((r, i) => {
    if (!r.title || !r.mediaType || !r.url) throw new ApiError(400, `Resource ${i + 1} incomplete`);
    if (!["image", "text", "mcq", "audio", "document_link"].includes(r.mediaType)) {
      throw new ApiError(400, `Invalid mediaType: ${r.mediaType}`);
    }
  });

  course.resources.push(...resources);
  await course.save();

  return res.status(200).json(new ApiResponse(200, { added: resources.length, total: course.resources.length }, "Resources added successfully"));
});

// ==================== DELETE VIDEO ====================


// ==================== DELETE RESOURCE ====================
const deleteResource = asyncHandler(async (req, res) => {
  const { courseId, resourceId } = req.params;
  const instructorId = req.user._id;

  const course = await Course.findOne({ _id: courseId, instructor: instructorId });
  if (!course) throw new ApiError(404, "Course not found or unauthorized");

  const resourceIndex = course.resources.findIndex(r => r._id.toString() === resourceId);
  if (resourceIndex === -1) throw new ApiError(404, "Resource not found");

  course.resources.splice(resourceIndex, 1);
  await course.save();

  return res.status(200).json(new ApiResponse(200, null, "Resource deleted successfully"));
});

//most view course

const getMostViewedCourses = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;

  // Step 1: Try to get most enrolled
  let topCourses = await Course.aggregate([
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "course_id",
        as: "enrollments"
      }
    },
    {
      $addFields: {
        enrolledCount: { $size: "$enrollments" },
        thumbnail: { $arrayElemAt: ["$videos.url", 0] }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "instructor",
        foreignField: "_id",
        as: "instructor"
      }
    },
    { $unwind: "$instructor" },
    {
      $project: {
        title: 1,
        description: 1,
        price: 1,
        thumbnail: 1,
        enrolledCount: 1,
        "instructor.fullName": 1
      }
    },
    { $sort: { enrolledCount: -1 } },
    { $limit: limit }
  ]);

  // Step 2: If no one enrolled → show random 4 courses
  if (topCourses.length === 0 || topCourses.every(c => c.enrolledCount === 0)) {
    topCourses = await Course.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "instructor",
          foreignField: "_id",
          as: "instructor"
        }
      },
      { $unwind: "$instructor" },
      {
        $project: {
          title: 1,
          description: 1,
          price: 1,
          thumbnail: { $arrayElemAt: ["$videos.url", 0] },
          "instructor.fullName": 1
        }
      },
      { $sample: { size: 4 } } // MongoDB এর built-in random
    ]);
  }

  return res.status(200).json(
    new ApiResponse(200, topCourses, "Top courses fetched")
  );
});


// course.controller.js

const getCoursesByCategory = asyncHandler(async (req, res) => {
  const grouped = await Course.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "instructor",
        foreignField: "_id",
        as: "instructor"
      }
    },
    { $unwind: "$instructor" },
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "course_id",
        as: "enrollments"
      }
    },
    {
      $addFields: {
        enrolledCount: { $size: "$enrollments" },
        thumbnail: { $arrayElemAt: ["$videos.url", 0] }
      }
    },
    {
      $project: {
        title: 1,
        description: 1,
        price: 1,
        thumbnail: 1,
        enrolledCount: 1,
        "instructor.fullName": 1,
        "instructor.userName": 1
      }
    },
    {
      $group: {
        _id: "$title",  // এখানে title = category
        courses: { $push: "$$ROOT" },
        totalCourses: { $sum: 1 },
        totalEnrollments: { $sum: "$enrolledCount" }
      }
    },
    {
      $sort: { totalEnrollments: -1 } // সবচেয়ে পপুলার ক্যাটাগরি আগে
    }
  ]);

  return res.status(200).json(
    new ApiResponse(200, grouped, "Courses grouped by category")
  );
});



export { createCourse,getAllCourses,addVideosToCourse ,addResourcesToCourse,deleteResource,getMostViewedCourses,getCoursesByCategory};