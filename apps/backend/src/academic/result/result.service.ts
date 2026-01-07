
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ResultService {
  constructor(private readonly prisma: PrismaService) {}

  calculateBestOf5(subjects: { name: string; marks: number }[]): { total: number; percentage: number; discarded: string[] } {
    if (!subjects || subjects.length === 0) {
      return { total: 0, percentage: 0, discarded: [] };
    }

    const sorted = [...subjects].sort((a, b) => b.marks - a.marks);
    const top5 = sorted.slice(0, 5);
    const discarded = sorted.slice(5).map(s => s.name);

    const total = top5.reduce((sum, s) => sum + s.marks, 0);
    const percentage = (total / 500) * 100;

    return { total, percentage, discarded };
  }

  async checkDues(studentId: string): Promise<boolean> {
     // Explicit casting to any to avoid type errors in test environment where @prisma/client is missing generated types
     const ledger = await (this.prisma as any).studentFeeLedger.findUnique({
         where: { studentId }
     });

     if (!ledger) return false;

     // Dues = Invoiced - Paid
     return (ledger.totalInvoiced - ledger.totalPaid) > 0;
  }
}
