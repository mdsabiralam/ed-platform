import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CalculationLogService {
  constructor(private prisma: PrismaService) {}

  async getLogs(examTermId: string) {
    return this.prisma.calculationLog.findMany({
      where: { examTermId },
      orderBy: { startedAt: 'desc' }
    });
  }
}
