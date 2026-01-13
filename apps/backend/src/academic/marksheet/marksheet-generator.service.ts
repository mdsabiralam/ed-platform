import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import sharp from 'sharp';

@Injectable()
export class MarksheetGeneratorService {
  async compressImage(buffer: Buffer): Promise<Uint8Array> {
    // Compress to JPEG with quality 80 (0.8)
    return await sharp(buffer).jpeg({ quality: 80 }).toBuffer();
  }

  async generatePdf(studentId: string): Promise<Readable> {
    // Create a new PDF Document
    const pdfDoc = await PDFDocument.create();

    // Add a blank page
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Simulate drawing School Logo and Student Photo
    // In a real scenario, we would fetch these from URL or DB
    // Here we create small placeholder buffers
    const logoBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 } // Red square for logo
      }
    }).png().toBuffer();

    const photoBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 0, g: 0, b: 255 } // Blue square for photo
      }
    }).png().toBuffer();

    // Compress images before embedding
    const compressedLogo = await this.compressImage(logoBuffer);
    const compressedPhoto = await this.compressImage(photoBuffer);

    // Embed images
    const logoImage = await pdfDoc.embedJpg(compressedLogo);
    const photoImage = await pdfDoc.embedJpg(compressedPhoto);

    // Draw Logo (Top-Left)
    page.drawImage(logoImage, {
      x: 30,
      y: height - 80,
      width: 50,
      height: 50,
    });

    // Draw Photo (Top-Right)
    page.drawImage(photoImage, {
      x: width - 80,
      y: height - 80,
      width: 50,
      height: 50,
    });

    // Draw some mock content
    page.drawText(`Marksheet for Student: ${studentId}`, {
      x: 50,
      y: height - 150,
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
