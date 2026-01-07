
import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class MarksheetGeneratorService {

  async generatePdf(studentId: string, resultData: any): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw Watermark
    page.drawText('Powered by ed', {
      x: width / 2 - 100,
      y: 50, // Bottom center-ish
      size: 20,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.5,
    });

    // Mock Logo (Top Left)
    page.drawText('SCHOOL LOGO', {
        x: 50,
        y: height - 50,
        size: 15,
        color: rgb(0, 0, 0)
    });

    // Mock Photo (Top Right)
    page.drawText('PHOTO', {
        x: width - 100,
        y: height - 50,
        size: 15,
        color: rgb(0, 0, 0)
    });

    // Student Info
    page.drawText(`Student ID: ${studentId}`, {
        x: 50,
        y: height - 100,
        size: 12,
        color: rgb(0, 0, 0)
    });

    // Result Data Table (Mock)
    let yPos = height - 150;
    if (resultData && resultData.subjects) {
        for (const sub of resultData.subjects) {
            page.drawText(`${sub.name}: ${sub.marks}`, {
                x: 50,
                y: yPos,
                size: 12
            });
            yPos -= 20;
        }
    }

    return await pdfDoc.save();
  }
}
