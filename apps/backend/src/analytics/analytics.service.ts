import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getClassPerformance(examId: string) {
    // 1. Fetch all marks for the exam
    const marks = await this.prisma.studentMark.findMany({
      where: { examId },
      include: { student: true },
      orderBy: { marks: 'desc' },
    });

    if (marks.length === 0) {
      return { top3: [], bottom3: [] };
    }

    // 2. Identify Top 3
    const top3 = marks.slice(0, 3).map(m => ({
      name: `${m.student.firstName} ${m.student.lastName}`,
      marks: m.marks,
      studentId: m.studentId
    }));

    // 3. Identify Bottom 3
    const bottom3 = marks.slice(-3).reverse().map(m => ({
        name: `${m.student.firstName} ${m.student.lastName}`,
        marks: m.marks,
        studentId: m.studentId
    }));

    return { top3, bottom3 };
  }
}
