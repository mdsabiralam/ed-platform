import { Controller, Get, Param, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('academic/marksheet')
export class MarksheetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('pdf/:studentId')
  async getMarksheetPdf(@Param('studentId') studentId: string) {
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

    // Return dummy PDF stream or message for verification
    return { message: 'Marksheet PDF generated successfully', studentId };
  }
}
