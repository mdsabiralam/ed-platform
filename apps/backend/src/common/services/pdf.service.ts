import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

@Injectable()
export class PdfService {
  async generateServiceBook(studentId: string): Promise<Uint8Array> {
    // 4.I.08 Add a visual indicator to generated PDFs.
    // If a Service Book is exported, overlay a "CONFIDENTIAL - INTERNAL USE ONLY" stamp.

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    // Add dummy content
    page.drawText(`Service Book for Student ID: ${studentId}`, {
      x: 50,
      y: height - 50,
      size: 20,
    });

    page.drawText('Official Record', {
      x: 50,
      y: height - 80,
      size: 14,
    });

    // Add Confidential Stamp
    const stampText = 'CONFIDENTIAL - INTERNAL USE ONLY';
    page.drawText(stampText, {
      x: 50,
      y: height / 2,
      size: 40,
      color: rgb(0.95, 0.1, 0.1), // Red
      opacity: 0.3, // Semi-transparent
      rotate: degrees(45),
    });

    // Add watermark on every page if needed
    // ...

    return await pdfDoc.save();
  }
}
