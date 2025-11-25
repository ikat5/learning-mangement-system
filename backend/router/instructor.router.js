// routes/instructor.routes.js
import { Router } from "express";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import {
    getApproveStudents,
    getMyCourseDetails,
    getMyCoursesWithStats,
} from "../controller/instructor.controller.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { addResourcesToCourse, addVideosToCourse, createCourse, deleteResource, deleteVideo } from "../controller/course.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(verifyRole("Instructor"));
console.log(5)
router.post(
  "/create-course",
  upload.array("files", 50),   // <-- now req.files is an ARRAY
  createCourse
);
router.post("/:courseId/add-videos", upload.array("files", 20), addVideosToCourse);
router.post("/:courseId/add-resources", addResourcesToCourse);

router.delete("/:courseId/video/:videoId", deleteVideo);
router.delete("/:courseId/resource/:resourceId", deleteResource);

router.get("/my-courses", getMyCoursesWithStats);
router.get("/approve-students/:courseId", getApproveStudents);

router.get("/course/:courseId/details", getMyCourseDetails);


export default router;