import { Injectable, NotFoundException } from '@nestjs/common';
import { PDFDocument, rgb } from 'pdf-lib';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MarksheetService {
  constructor(private readonly prisma: PrismaService) {}

  async generateMarksheetPdf(studentId: string, tenantId: string): Promise<Buffer> {
    const student = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: { results: { orderBy: { calculatedAt: 'desc' }, take: 1 } }
    });

    if (!student) throw new NotFoundException('Student not found');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    page.drawText('REPORT CARD', { x: 200, y: height - 50, size: 30 });
    page.drawText(`Name: ${student.firstName} ${student.lastName}`, { x: 50, y: height - 100, size: 18 });

    if (student.results.length > 0) {
        const result = student.results[0];
        page.drawText(`Percentage: ${result.percentage}%`, { x: 50, y: height - 130, size: 18 });
        page.drawText(`Status: ${result.resultStatus}`, { x: 50, y: height - 160, size: 18 });
    } else {
        page.drawText(`Results not yet declared.`, { x: 50, y: height - 130, size: 18 });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
