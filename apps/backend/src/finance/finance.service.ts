import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async createLedger(studentId: string, tenantId: string, amount: number) {
    return this.prisma.feeLedger.create({
      data: {
        studentId,
        tenantId,
        amountDue: amount,
        dueDate: new Date(),
        status: 'PENDING',
      },
    });
  }
}
