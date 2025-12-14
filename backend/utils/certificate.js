import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

export const generateCertificatePDF = async ({ learnerName, courseTitle, certificateId }) => {
  const certificatesDir = path.resolve("public", "certificates");
  await fs.promises.mkdir(certificatesDir, { recursive: true });

  const fileName = `${certificateId}.pdf`;
  const filePath = path.join(certificatesDir, fileName);

  const doc = new PDFDocument({ size: "A4", margin: 48 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Background and framing
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f4f7fb");
  doc.fillColor("#0f172a");
  doc.roundedRect(24, 24, doc.page.width - 48, doc.page.height - 48, 16)
    .lineWidth(2)
    .stroke("#0ea5e9");

  doc.moveDown(3);
  doc
    .fontSize(28)
    .fillColor("#0ea5e9")
    .text("Certificate of Completion", { align: "center" });

  doc.moveDown(1.2);
  doc.fontSize(14).fillColor("#0f172a").text("This certifies that", { align: "center" });

  doc.moveDown(0.6);
  doc.fontSize(26).fillColor("#0b1021").text(learnerName, { align: "center" });

  doc.moveDown(0.6);
  doc
    .fontSize(14)
    .fillColor("#0f172a")
    .text("has successfully completed the course", { align: "center" });

  doc.moveDown(0.6);
  doc.fontSize(22).fillColor("#0ea5e9").text(courseTitle, { align: "center" });

  doc.moveDown(1.5);
  doc.fontSize(12).fillColor("#1f2937").text(`Certificate ID: ${certificateId}`, { align: "center" });
  doc.moveDown(0.4);
  doc.text(`Issued on: ${new Date().toLocaleDateString()}`, { align: "center" });

  doc.moveDown(2);
  doc
    .fontSize(10)
    .fillColor("#6b7280")
    .text(
      "This document is system-generated and verifiable with the provided certificate ID.",
      { align: "center" }
    );

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  const publicPath = `/public/certificates/${fileName}`;
  return { filePath, publicPath };
};
