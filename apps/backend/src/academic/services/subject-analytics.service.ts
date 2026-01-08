import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubjectAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async calculateAndStore(examId: string) {
    const allMarks = await this.prisma.studentMark.findMany({
        where: { examId }
    });

    if (allMarks.length === 0) return;

    const scores = allMarks.map(m => m.totalMarks);
    const total = scores.reduce((a, b) => a + b, 0);
    const average = total / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    await this.prisma.subjectAnalytics.upsert({
        where: { examId },
        update: { average, highest, lowest, calculatedAt: new Date() },
        create: { examId, average, highest, lowest }
    });
  }
}
