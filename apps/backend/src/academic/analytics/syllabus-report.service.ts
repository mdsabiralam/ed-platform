import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class SyllabusReportService {
  constructor(private prisma: PrismaService) {}

  async generateSyllabusReport(tenantId: string, classId: string, subjectId: string) {
    const plan = await this.prisma.curriculumPlan.findFirst({
      where: { tenantId, classId, subjectId },
      orderBy: { version: 'desc' },
      include: {
        subject: true,
        class: true,
        chapters: {
          orderBy: { chapterNumber: 'asc' },
          include: {
            topics: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!plan) throw new NotFoundException('Curriculum Plan not found');

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;
    const fontSize = 12;
    const lineHeight = 20;

    // Header
    page.drawText('Syllabus Completion Report', { x: 50, y, size: 18, font: boldFont });
    y -= 30;
    page.drawText(`Class: ${plan.class.name} | Subject: ${plan.subject.name}`, { x: 50, y, size: 14, font });
    y -= 20;
    page.drawText(`Academic Year: ${plan.academicYear} | Version: ${plan.version}`, { x: 50, y, size: 12, font });
    y -= 40;

    // Table Header
    page.drawText('Chapter', { x: 50, y, size: 10, font: boldFont });
    page.drawText('Topic', { x: 150, y, size: 10, font: boldFont });
    page.drawText('Target Date', { x: 350, y, size: 10, font: boldFont });
    page.drawText('Actual Date', { x: 450, y, size: 10, font: boldFont });
    y -= lineHeight;

    // Draw Line
    page.drawLine({ start: { x: 50, y: y + 15 }, end: { x: 550, y: y + 15 }, thickness: 1, color: rgb(0, 0, 0) });

    for (const chapter of plan.chapters) {
      if (y < 50) { page = pdfDoc.addPage(); y = height - 50; }

      const targetDate = chapter.targetCompletionDate
        ? chapter.targetCompletionDate.toISOString().split('T')[0]
        : '-';

      page.drawText(`${chapter.chapterNumber}. ${chapter.name}`, { x: 50, y, size: 10, font: boldFont });

      for (const topic of chapter.topics) {
        if (y < 50) { page = pdfDoc.addPage(); y = height - 50; }

        const actualDate = topic.actualCompletionDate
          ? topic.actualCompletionDate.toISOString().split('T')[0]
          : 'Pending';

        page.drawText(topic.name, { x: 150, y, size: 10, font });
        page.drawText(targetDate, { x: 350, y, size: 10, font });
        page.drawText(actualDate, { x: 450, y, size: 10, font });

        y -= lineHeight;
      }
      y -= 10; // Spacing between chapters
    }

    return await pdfDoc.save();
  }
}
