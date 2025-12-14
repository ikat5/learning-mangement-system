// routes/instructor.routes.js
import { Router } from "express";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import {
  getApproveStudents,
  getCoursesEarningsForChart,
  getMyCourseDetails,
  getMyCoursesWithStats,
} from "../controller/instructor.controller.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { addResourcesToCourse, addVideosToCourse, createCourse, deleteResource, updateCourseThumbnail } from "../controller/course.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(verifyRole("Instructor"));
console.log(5)
router.post(
  "/create-course",
  upload.fields([
    { name: "files", maxCount: 50 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  createCourse
);
router.post("/:courseId/add-videos", upload.array("files", 20), addVideosToCourse);
router.post("/:courseId/add-resources", addResourcesToCourse);
router.put("/:courseId/thumbnail", upload.single("thumbnail"), updateCourseThumbnail);


router.delete("/:courseId/resource/:resourceId", deleteResource);

router.get("/my-courses", getMyCoursesWithStats);
router.get("/approve-students/:courseId", getApproveStudents);
router.get("/total-earning-forChart", getCoursesEarningsForChart)

router.get("/course/:courseId/details", getMyCourseDetails);


export default router;