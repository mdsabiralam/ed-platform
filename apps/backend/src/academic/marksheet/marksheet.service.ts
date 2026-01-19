import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PDFDocument, rgb } from 'pdf-lib';

@Injectable()
export class MarksheetService {
  constructor(private prisma: PrismaService) {}

  async generatePdf(studentId: string): Promise<Buffer> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { marks: true }
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const fontSize = 20;

    page.drawText(`Final Term Report Card: ${student.firstName} ${student.lastName}`, {
      x: 50,
      y: height - 4 * fontSize,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    let yPosition = height - 100;

    // Draw Table Header
    page.drawText('Subject', { x: 50, y: yPosition, size: 12 });
    page.drawText('Score', { x: 250, y: yPosition, size: 12 });
    page.drawText('Total', { x: 350, y: yPosition, size: 12 });
    yPosition -= 20;

    student.marks.forEach(mark => {
       page.drawText(mark.subject, { x: 50, y: yPosition, size: 12 });
       page.drawText(mark.score.toString(), { x: 250, y: yPosition, size: 12 });
       page.drawText(mark.total.toString(), { x: 350, y: yPosition, size: 12 });
       yPosition -= 20;
    });

    // Save
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
