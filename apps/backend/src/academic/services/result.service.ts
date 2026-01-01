import { Injectable } from '@nestjs/common';

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
}
