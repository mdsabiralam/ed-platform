import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SubjectResultInput {
  subjectId: string;
  score: number;
  passMark: number;
}

export interface GraceResultOutput {
  results: (SubjectResultInput & { isGraceApplied: boolean })[];
  graceUsed: number;
}

@Injectable()
export class ResultService {
  constructor(private prisma: PrismaService) {}

  /**
   * 6.B.06: Pass Criteria Logic
   * A student must score 33% in Theory AND 33% in Practical separately to pass.
   */
  checkPassCriteria(
    theoryScore: number,
    practicalScore: number | null,
    maxTheory: number,
    maxPractical: number | null,
  ): boolean {
    if (maxTheory <= 0) {
        return false;
    }

    const theoryPass = (theoryScore / maxTheory) >= 0.33;

    if (maxPractical && maxPractical > 0) {
      // If practical exists, it must also be passed.
      if (practicalScore === null) return false;

      const practicalPass = (practicalScore / maxPractical) >= 0.33;
      return theoryPass && practicalPass;
    }

    return theoryPass;
  }

  /**
   * 6.B.07: GPA/CGPA Calculation
   * Calculate CGPA and determine status.
   * If any subject is "Failed" (Grade Point 0), status is "Needs Improvement".
   */
  calculateCGPA(gradePoints: number[]): { cgpa: number; status: string } {
    if (gradePoints.length === 0) {
      return { cgpa: 0, status: 'Needs Improvement' };
    }

    const hasFailed = gradePoints.some((gp) => gp === 0);
    const sum = gradePoints.reduce((acc, val) => acc + val, 0);
    const avg = sum / gradePoints.length;

    // Round to 2 decimal places
    const cgpa = Math.round(avg * 100) / 100;

    return {
      cgpa,
      status: hasFailed ? 'Needs Improvement' : 'Passed',
    };
  }

  /**
   * 6.B.08: Grace Marks Logic
   * Apply grace marks to failed subjects up to max_grace_marks.
   */
  applyGraceMarks(
    results: SubjectResultInput[],
    maxGraceMarks: number = 5,
  ): GraceResultOutput {
    let graceUsed = 0;

    const processedResults = results.map((result) => {
      const isFailed = result.score < result.passMark;

      if (!isFailed) {
          return { ...result, isGraceApplied: false };
      }

      const deficit = result.passMark - result.score;

      // Condition: Deficit <= 5 (subject deficit limit implied by "X <= 5")
      if (deficit <= 5) {
          const remainingGrace = maxGraceMarks - graceUsed;
          if (deficit <= remainingGrace) {
              graceUsed += deficit;
              return {
                  ...result,
                  score: result.passMark,
                  isGraceApplied: true
              };
          }
      }

      return { ...result, isGraceApplied: false };
    });

    return {
      results: processedResults,
      graceUsed,
    };
  }

  /**
   * 6.B.10: Calculate Grade from Score
   */
  calculateGrade(
    score: number,
    scaleLogics: { minScore: number | null; maxScore: number | null; label: string }[],
  ): string {
    if (score < 0) {
      throw new Error('Invalid Score: Score cannot be negative');
    }

    // Find matching logic
    const match = scaleLogics.find((logic) => {
      if (logic.minScore !== null && logic.maxScore !== null) {
        return score >= logic.minScore && score <= logic.maxScore;
      }
      return false;
    });

    if (match) {
      return match.label;
    }

    throw new Error('Invalid Score: No grade found for this score');
  }

  async calculateTermAggregation(studentId: string, tenantId: string) {
    const terms = await this.prisma.examTerm.findMany({
      where: { tenantId },
    });

    let finalWeightedScore = 0;
    let totalWeightUsed = 0;

    for (const term of terms) {
      if (term.weightage > 0) {
        const summary = await this.prisma.resultSummary.findUnique({
          where: {
            studentId_examTermId: {
              studentId,
              examTermId: term.id,
            },
          },
        });

        if (summary) {
          finalWeightedScore += summary.percentage * term.weightage;
          totalWeightUsed += term.weightage;
        }
      }
    }

    return { finalWeightedScore, totalWeightUsed };
  }

  /**
   * 6.E.03: Best of 5 Logic
   */
  calculateBestOfFive(marks: number[], maxPerSubject: number = 100) {
    // 1. Sort descending
    const sorted = [...marks].sort((a, b) => b - a);

    // 2. Take top 5 (or less if fewer subjects)
    const top5 = sorted.slice(0, 5);

    // 3. Calculate total and percentage
    const totalMarks = top5.reduce((sum, m) => sum + m, 0);
    const maxTotal = top5.length * maxPerSubject;

    const percentage = maxTotal > 0 ? (totalMarks / maxTotal) * 100 : 0;

    return {
      totalMarks,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimals
      subjectsConsidered: top5.length
    };
  }

  /**
   * 6.E.04: Calculate Ranks
   */
  async calculateRanks(examTermId: string) {
    // Class Rank
    await this.prisma.$executeRaw`
      WITH Ranked AS (
        SELECT id, RANK() OVER (ORDER BY total_marks DESC) as rnk
        FROM result_summaries
        WHERE exam_term_id = ${examTermId}
      )
      UPDATE result_summaries
      SET class_rank = cast(Ranked.rnk as integer)
      FROM Ranked
      WHERE result_summaries.id = Ranked.id
    `;

    // Section Rank
    await this.prisma.$executeRaw`
      WITH Ranked AS (
        SELECT rs.id, RANK() OVER (PARTITION BY s.section_id ORDER BY rs.total_marks DESC) as rnk
        FROM result_summaries rs
        JOIN students s ON rs.student_id = s.id
        WHERE rs.exam_term_id = ${examTermId}
      )
      UPDATE result_summaries
      SET section_rank = cast(Ranked.rnk as integer)
      FROM Ranked
      WHERE result_summaries.id = Ranked.id
    `;
  }
}
