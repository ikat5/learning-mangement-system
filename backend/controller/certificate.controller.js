import { Certificate } from "../model/certificate.model.js";
import { Course } from "../model/course.model.js";
import { Learner } from "../model/learner.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateCertificatePDF } from "../utils/pdfGenerator.js";

// Internal helper to get or create certificate (used by trigger)
export const getOrCreateCertificate = async (learnerId, courseId) => {
    let cert = await Certificate.findOne({ learner: learnerId, course: courseId });
    if (cert) return cert;

    // Create new
    const serialNumber = `EDU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const course = await Course.findById(courseId);

    cert = await Certificate.create({
        serialNumber,
        learner: learnerId,
        course: courseId,
        instructor: course.instructor
    });

    return cert;
};

// Helper for generating PDF response
const sendPDF = async (cert, res) => {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${cert.serialNumber}`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Certificate-${cert.serialNumber}.pdf`);

    await generateCertificatePDF({
        learnerName: cert.learner.fullName,
        courseTitle: cert.course.title,
        instructorName: cert.instructor?.fullName || "Instructor",
        issueDate: cert.issueDate,
        serialNumber: cert.serialNumber,
        verificationUrl
    }, res);
};

export const downloadCertificate = asyncHandler(async (req, res) => {
    const { serialNumber } = req.params;

    const cert = await Certificate.findOne({ serialNumber })
        .populate("learner", "fullName")
        .populate("course", "title")
        .populate("instructor", "fullName");

    if (!cert) {
        throw new ApiError(404, "Certificate not found");
    }

    await sendPDF(cert, res);
});

export const downloadCertificateByCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const learnerId = req.user._id;

    // Check if learner actually completed the course
    const learner = await Learner.findById(learnerId);
    const enrollment = learner.courses_enrolled.find(c => c.course.toString() === courseId);

    if (!enrollment || enrollment.status !== "Completed") {
        throw new ApiError(403, "Course not completed yet.");
    }

    // Get or create certificate
    let cert = await getOrCreateCertificate(learnerId, courseId);

    // Populate for PDF
    cert = await Certificate.findById(cert._id)
        .populate("learner", "fullName")
        .populate("course", "title")
        .populate("instructor", "fullName");

    await sendPDF(cert, res);
});


export const verifyCertificate = asyncHandler(async (req, res) => {
    const { serialNumber } = req.params;

    const cert = await Certificate.findOne({ serialNumber })
        .populate("learner", "fullName")
        .populate("course", "title")
        .populate("instructor", "fullName");

    if (!cert) {
        throw new ApiError(404, "Certificate not found");
    }

    res.json(new ApiResponse(200, {
        valid: !cert.isRevoked,
        details: {
            learnerName: cert.learner.fullName,
            courseTitle: cert.course.title,
            instructorName: cert.instructor?.fullName,
            issueDate: cert.issueDate,
            serialNumber: cert.serialNumber
        }
    }, "Certificate verified successfully"));
});

export const getMyCertificates = asyncHandler(async (req, res) => {
    const learnerId = req.user._id;
    const certs = await Certificate.find({ learner: learnerId })
        .populate("course", "title")
        .sort("-issueDate");

    res.json(new ApiResponse(200, certs, "Certificates fetched"));
});
