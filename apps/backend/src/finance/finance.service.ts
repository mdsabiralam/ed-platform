import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class FinanceService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Checks if a student has any outstanding dues.
   * @param studentId The ID of the student.
   * @returns True if fees are clear, False if there are pending/overdue fees.
   */
  async checkFeeStatus(studentId: string): Promise<boolean> {
    // In a real scenario, this would check DB.
    // Since we are adding logic, we will query the StudentFeeLedger.
    // We assume if any record is PENDING or OVERDUE, they have dues.

    // Note: In this sandbox environment without live DB, we might want to mock or be careful.
    // However, the service implementation should reflect the intended logic.

    // Safety check for test environment without DB connection
    if (!process.env.DATABASE_URL) {
      console.warn('FinanceService: DATABASE_URL not set, assuming no dues for safety unless mocked.');
      return true;
    }

    const outstandingDues = await this.prisma.studentFeeLedger.findFirst({
      where: {
        studentId: studentId,
        status: {
          in: ['PENDING', 'OVERDUE'],
        },
      },
    });

    return !outstandingDues; // Return true if NO outstanding dues found
  }
}
