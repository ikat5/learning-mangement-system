import { Router } from "express";
import { downloadCertificate, getMyCertificates, verifyCertificate, downloadCertificateByCourse } from "../controller/certificate.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public verification
router.get("/verify/:serialNumber", verifyCertificate);

// Protected routes
router.use(verifyJWT);
router.get("/my-certificates", getMyCertificates);
router.get("/download/:serialNumber", downloadCertificate);
router.get("/download-by-course/:courseId", downloadCertificateByCourse);

export default router;
