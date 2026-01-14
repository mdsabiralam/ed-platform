import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ResultService {
  constructor(private readonly prisma: PrismaService) {}

  // 6.B.06: Check Pass Status
  checkPassStatus(theory: number, practical: number, maxTheory: number, maxPractical: number): boolean {
    const theoryPass = maxTheory > 0 ? (theory / maxTheory) >= 0.33 : true;
    const practicalPass = maxPractical > 0 ? (practical / maxPractical) >= 0.33 : true;
    return theoryPass && practicalPass;
  }

  // 6.B.07: Calculate CGPA
  calculateCGPA(gradePoints: number[]): number {
    if (gradePoints.length === 0) return 0;

    // Check if any subject is Failed (0 point) -> Result "Needs Improvement" (handled by caller logic typically)
    // For pure CGPA calculation:
    const sum = gradePoints.reduce((a, b) => a + b, 0);
    const avg = sum / gradePoints.length;
    return parseFloat(avg.toFixed(2));
  }

  // 6.B.08: Apply Grace Marks
  applyGraceMarks(marks: number, passMark: number, maxGrace: number = 5): { passed: boolean; graceUsed: number; finalMark: number } {
    if (marks >= passMark) return { passed: true, graceUsed: 0, finalMark: marks };

    const deficit = passMark - marks;
    if (deficit <= maxGrace) {
        return { passed: true, graceUsed: deficit, finalMark: passMark };
    }

    return { passed: false, graceUsed: 0, finalMark: marks };
  }

  // 6.B.10 Logic: Calculate Grade from Score
  async calculateGrade(score: number, scaleId: string): Promise<string> {
    const logicList = await this.prisma.gradingLogic.findMany({
      where: { scaleId },
      orderBy: { minScore: 'desc' }, // Check from highest range down
    });

    if (score > 100 || score < 0) throw new Error('Invalid Score');

    for (const logic of logicList) {
        // Range check: min <= score <= max
        // Precision handling: We treat 90.9 as part of 81-90 if logic is strictly handled,
        // but typically 91-100 includes 91.
        // Let's assume inclusive range.
        if (score >= logic.minScore && score <= logic.maxScore) {
            return logic.label;
        }
    }

    // Fallback if gaps exist or score is 0
    return 'F';
  }

  // Fetch Rubric for 6.B.05
  async getRubric(subjectId: string, tenantId: string) {
      // 1. Check mapping
      const map = await this.prisma.subjectGradingMap.findUnique({
          where: { subjectId },
          include: { gradingScale: { include: { logic: true } } }
      });

      if (map) return map.gradingScale.logic;

      // 2. Fallback to default
      const defaultScale = await this.prisma.gradingScale.findFirst({
          where: { tenantId, name: { contains: 'CBSE' } }, // Simple heuristic for now
          include: { logic: true }
      });

      if (!defaultScale) throw new NotFoundException('No grading scale found for this subject');
      return defaultScale.logic;
  }
}
