import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PDFDocument, rgb } from 'pdf-lib';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PrintService {
  private readonly logger = new Logger(PrintService.name);
  private readonly uploadDir = 'uploads/print_jobs';

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // Cron Job to cleanup old files
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldPrintJobs() {
    this.logger.log('Cleaning up old print job files...');
    // Clean up files older than 24 hours to prevent storage bloat
    const retentionPeriod = new Date();
    retentionPeriod.setHours(retentionPeriod.getHours() - 24);

    const jobs = await this.prisma.printJob.findMany({
      where: {
        status: { in: ['COMPLETED', 'REJECTED'] },
        updatedAt: { lt: retentionPeriod },
        fileUrl: { not: '' } // Only if fileUrl is set (and assuming string)
      }
    });

    for (const job of jobs) {
      try {
        if (job.fileUrl && fs.existsSync(job.fileUrl)) {
          fs.unlinkSync(job.fileUrl);
          this.logger.log(`Deleted file for job ${job.id}`);
        }
        // Optionally clear the URL in DB so we don't try again
        await this.prisma.printJob.update({
          where: { id: job.id },
          data: { fileUrl: '' } // Or handle as null if nullable
        });
      } catch (err) {
        this.logger.error(`Failed to delete file for job ${job.id}: ${err.message}`);
      }
    }
  }

  // 1. Create Print Job
  async createPrintJob(tenantId: string, jobType: string, fileUrl: string) {
    return this.prisma.printJob.create({
      data: {
        tenantId,
        jobType,
        status: 'PENDING_APPROVAL',
        fileUrl,
      },
    });
  }

  // 2. Generate ID Card PDF with Bleed and Crop Marks
  async generateIdCardPdf(tenantId: string, studentData: any[]) {
    // Critical: Add 'Crop Marks' and 3mm 'Bleed Area'
    // A4 size: 210 x 297 mm
    // Standard ID Card: 85.60 x 53.98 mm (CR80)
    // Bleed: 3mm on all sides
    // Total size per card: 91.6 x 59.98 mm

    // We'll generate a single page PDF for now
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points (1 pt = 1/72 inch)
    const { width, height } = page.getSize();

    // Convert mm to points: 1 mm = 2.83465 pt
    const mmToPt = 2.83465;
    const bleed = 3 * mmToPt;
    const cardWidth = 85.6 * mmToPt;
    const cardHeight = 54 * mmToPt;

    let x = 50;
    let y = height - 100;

    for (const student of studentData) {
      // Draw Crop Marks (Lines outside the bleed area)
      // Top-Left Horizontal
      page.drawLine({
        start: { x: x - 10, y: y },
        end: { x: x, y: y },
        color: rgb(0, 0, 0),
        thickness: 0.5,
      });
      // Top-Left Vertical
      page.drawLine({
        start: { x: x, y: y + 10 },
        end: { x: x, y: y },
        color: rgb(0, 0, 0),
        thickness: 0.5,
      });

      // Background (Bleed Area)
      page.drawRectangle({
        x: x - bleed,
        y: y - cardHeight - bleed,
        width: cardWidth + 2 * bleed,
        height: cardHeight + 2 * bleed,
        color: rgb(0.9, 0.9, 0.9), // Light gray background
      });

      // Actual Card Content Area
      page.drawRectangle({
        x: x,
        y: y - cardHeight,
        width: cardWidth,
        height: cardHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      // Text
      page.drawText(student.name, {
        x: x + 10,
        y: y - 20,
        size: 12,
        color: rgb(0, 0, 0),
      });
      page.drawText(`ID: ${student.id}`, {
        x: x + 10,
        y: y - 40,
        size: 10,
        color: rgb(0, 0, 0),
      });

      // Move to next position (simplified grid)
      y -= (cardHeight + 20 + bleed * 2);
      if (y < 100) {
        y = height - 100;
        x += (cardWidth + 20 + bleed * 2);
      }
    }

    const pdfBytes = await pdfDoc.save();
    const filename = `id_cards_${Date.now()}.pdf`;
    const filePath = path.join(this.uploadDir, filename);
    fs.writeFileSync(filePath, pdfBytes);

    // Save job record
    return this.createPrintJob(tenantId, 'ID_CARD_BATCH', filePath);
  }

  async approveJob(jobId: string, approvedBy: string) {
    return this.prisma.printJob.update({
      where: { id: jobId },
      data: {
        status: 'APPROVED',
        approvedBy,
      },
    });
  }
}
