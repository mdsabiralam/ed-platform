import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ResultService {
  constructor(private readonly prisma: PrismaService) {}

  async checkFeeStatus(studentId: string): Promise<boolean | string> {
    const feeLedger = await this.prisma.studentFeeLedger.findFirst({
      where: { studentId },
    });

    if (!feeLedger) {
      // Assuming no ledger means no dues, or could mean student not found.
      // Default to true for now as safe fallback or false if strict.
      return true;
    }

    const totalDue = feeLedger.totalInvoiced - feeLedger.totalPaid;

    if (totalDue > 0) {
      return `Outstanding Fees Detected: ${totalDue}`;
    }

    return true;
  }

  async checkLibraryDues(studentId: string): Promise<boolean | string> {
    const overdueBooks = await this.prisma.libraryCirculation.findFirst({
      where: {
        studentId,
        status: 'ISSUED',
        dueDate: {
          lt: new Date(),
        },
      },
    });

    if (overdueBooks) {
      return 'Library books not returned';
    }

    const unpaidFines = await this.prisma.libraryCirculation.findFirst({
      where: {
        studentId,
        fineAmount: {
          gt: 0,
        },
        isFinePaid: false,
      },
    });

    if (unpaidFines) {
      return 'Outstanding Library Fines';
    }

    return true;
  }
}
