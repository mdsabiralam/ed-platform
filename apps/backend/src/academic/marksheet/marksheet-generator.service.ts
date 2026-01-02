import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class MarksheetGeneratorService {
  async generatePdf(studentId: string): Promise<Readable> {
    // Create a new PDF Document
    const pdfDoc = await PDFDocument.create();

    // Add a blank page
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw some mock content
    page.drawText(`Marksheet for Student: ${studentId}`, {
      x: 50,
      y: height - 50,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });

    // Inject Watermark
    const watermarkText = 'Powered by ed';
    const watermarkSize = 12;
    const watermarkColor = rgb(0.8, 0.8, 0.8); // Light Grey
    const watermarkOpacity = 0.5;

    const pages = pdfDoc.getPages();
    for (const p of pages) {
      const { width, height } = p.getSize();
      const textWidth = font.widthOfTextAtSize(watermarkText, watermarkSize);

      p.drawText(watermarkText, {
        x: (width - textWidth) / 2, // Center horizontally
        y: 30, // Bottom margin
        size: watermarkSize,
        font,
        color: watermarkColor,
        opacity: watermarkOpacity,
      });
    }

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Convert Uint8Array to Readable Stream
    const stream = new Readable();
    stream.push(pdfBytes);
    stream.push(null);
    return stream;
  }
}
