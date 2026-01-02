import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class PdfGeneratorService {
  async generateMarksheet(data: any): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]); // A4-ish
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 3. School Logo (Top-Left)
    // Simulating image drawing with text or rectangle for now as we don't have real images
    page.drawText('School Logo', {
      x: 20,
      y: height - 50,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    // 3. Student Photo (Top-Right)
    page.drawText('Student Photo', {
      x: width - 100,
      y: height - 50,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Main Content Area (To ensure no overlap with watermark)
    page.drawText('Marksheet Content...', {
      x: 50,
      y: height - 100,
      size: 14,
      font: font,
      color: rgb(0, 0, 0),
    });

    // 2. Watermark "Powered by ed" (Bottom-Center, Opacity 0.5)
    const watermarkText = 'Powered by ed';
    const watermarkSize = 20;
    const textWidth = font.widthOfTextAtSize(watermarkText, watermarkSize);

    page.drawText(watermarkText, {
      x: (width - textWidth) / 2,
      y: 30, // Bottom padding
      size: watermarkSize,
      font: font,
      color: rgb(0.5, 0.5, 0.5), // Grey-ish
      opacity: 0.5, // 2. Opacity 0.5
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
