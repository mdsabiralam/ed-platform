import { Controller, Get, Param, ForbiddenException, Inject, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfGeneratorService } from '../services/pdf-generator.service';

@Controller('academic/marksheet')
export class MarksheetController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfGeneratorService,
  ) {}

  @Get('pdf/:studentId')
  async getMarksheetPdf(
    @Param('studentId') studentId: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    // 6.J.03: Conditional Result Publishing Security Check
    // Check if the student has any outstanding dues

    const feeLedger = await this.prisma.studentFeeLedger.findFirst({
      where: {
        studentId: studentId,
        status: { in: ['PENDING', 'OVERDUE'] }, // Check for unpaid status
        // Alternatively check amountDue > 0
        amountDue: { gt: 0 }
      },
    });

    if (feeLedger) {
       throw new ForbiddenException('Please clear outstanding dues to view result');
    }

    // Generate PDF using service
    const pdfBuffer = await this.pdfService.generateMarksheet({ studentId });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="marksheet-${studentId}.pdf"`,
    });

    return new StreamableFile(pdfBuffer);
  }
}
