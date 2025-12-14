import express from "express";
import { getAllCourses, getCoursesByCategory, getMostViewedCourses, getPublicCourseDetails } from "../controller/course.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multerMiddleware.js";

const router = express.Router();


router.get("/get-courses", getAllCourses);
// course.routes.js বা public route

router.get("/by-category", getCoursesByCategory);
router.get("/most-enrolled", getMostViewedCourses);
router.get("/:courseId/public", getPublicCourseDetails);


export default router;