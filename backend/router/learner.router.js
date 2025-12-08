import { Router } from "express";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";

import {
    enrollInCourse,
    getMyCourses,
    getCourseContent,
    updateVideoProgress,
    getBuyableCourses,
    updateBankInfo,
    getMyBalance
} from "../controller/learner.controller.js";

const router = Router();

// All routes require authentication & Learner role
router.use(verifyJWT);
router.use(verifyRole("Learner"));

// 1. Enroll in a course
router.post("/enroll", enrollInCourse);

// 2. Get all enrolled courses with progress
router.get("/my-courses", getMyCourses);

// 3. Get full content of a specific enrolled course
router.get("/course/:courseId", getCourseContent);

// 4. Save video progress
router.post("/course/progress", updateVideoProgress);

router.get("/buyable-course", getBuyableCourses)

router.post("/bank-info", updateBankInfo);
router.get("/balance", getMyBalance);



export default router;
