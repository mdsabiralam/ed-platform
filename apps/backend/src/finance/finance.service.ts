import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getDailyCollection(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.prisma.feeReceipt.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        paymentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return result._sum.amount || 0;
  }
}
