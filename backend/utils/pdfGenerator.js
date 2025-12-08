import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export const generateCertificatePDF = async (certificateData, res) => {
    const { learnerName, courseTitle, instructorName, issueDate, serialNumber, verificationUrl } = certificateData;

    // Create a document
    const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        margin: 50
    });

    // Pipe directly to the response
    doc.pipe(res);

    // --- Background / Border ---
    // A simple elegant border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .strokeColor("#4f46e5") // Indigo-600
        .lineWidth(5)
        .stroke();

    // Inner thin border
    doc.rect(28, 28, doc.page.width - 56, doc.page.height - 56)
        .strokeColor("#e0e7ff") // Indigo-100
        .lineWidth(2)
        .stroke();

    // --- Header ---
    doc.moveDown(2);
    doc.font("Helvetica-Bold")
        .fontSize(40)
        .fillColor("#1e1b4b") // Indigo-950
        .text("Certificate of Completion", { align: "center" });

    doc.moveDown(0.5);
    doc.font("Helvetica")
        .fontSize(16)
        .fillColor("#64748b") // Slate-500
        .text("This is to certify that", { align: "center" });

    // --- Learner Name ---
    doc.moveDown(1.5);
    doc.font("Helvetica-Bold")
        .fontSize(32)
        .fillColor("#4f46e5") // Indigo-600
        .text(learnerName, { align: "center" });

    doc.moveDown(0.2);
    // Underline
    const textWidth = doc.widthOfString(learnerName);
    const startX = (doc.page.width - textWidth) / 2;
    doc.moveTo(startX, doc.y).lineTo(startX + textWidth, doc.y).strokeColor("#4f46e5").lineWidth(1).stroke();


    doc.moveDown(1.5);
    doc.font("Helvetica")
        .fontSize(16)
        .fillColor("#64748b")
        .text("has successfully completed the course", { align: "center" });

    // --- Course Title ---
    doc.moveDown(1);
    doc.font("Helvetica-Bold")
        .fontSize(24)
        .fillColor("#0f172a") // Slate-900
        .text(courseTitle, { align: "center" });

    // --- Date & Instructor Section ---
    doc.moveDown(4);

    const bottomY = doc.y;
    const leftX = 100;
    const rightX = doc.page.width - 250;

    // Date
    doc.font("Helvetica")
        .fontSize(12)
        .fillColor("#64748b")
        .text("Date Issued:", leftX, bottomY);

    doc.font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#0f172a")
        .text(new Date(issueDate).toLocaleDateString(), leftX, bottomY + 20);

    // Instructor Signature Line
    doc.moveTo(rightX, bottomY + 15).lineTo(rightX + 150, bottomY + 15).strokeColor("#cbd5e1").lineWidth(1).stroke();

    doc.font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#0f172a")
        .text(instructorName, rightX, bottomY + 25, { width: 150, align: "center" });

    doc.font("Helvetica")
        .fontSize(10)
        .fillColor("#64748b")
        .text("Instructor", rightX, bottomY + 45, { width: 150, align: "center" });


    // --- QC Code & Footer ---
    const qrCodeData = await QRCode.toDataURL(verificationUrl);
    doc.image(qrCodeData, doc.page.width / 2 - 40, doc.page.height - 130, { width: 80 });

    doc.fontSize(10)
        .fillColor("#94a3b8")
        .text(`Certificate ID: ${serialNumber}`, 0, doc.page.height - 40, { align: "center" });

    doc.end();
};
