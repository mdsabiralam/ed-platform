import { Injectable } from '@nestjs/common';

export interface SubjectScore {
  subjectName: string;
  score: number; // Obtained score
  maxMarks?: number; // Default 100
}

export interface AggregationResult {
  totalObtained: number;
  totalMax: number;
  percentage: number;
  consideredSubjects: SubjectScore[];
  discardedSubjects: SubjectScore[];
}

@Injectable()
export class ResultService {
  calculateBestOf5(scores: SubjectScore[]): AggregationResult {
    // Ensure we have at least 5 subjects?
    // If less than 5, we just take all of them?
    // The prompt implies "Best of 5", usually applicable when count >= 5.

    // Sort by score descending
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);

    const consideredSubjects = sortedScores.slice(0, 5);
    const discardedSubjects = sortedScores.slice(5);

    const totalObtained = consideredSubjects.reduce((sum, sub) => sum + sub.score, 0);
    // Assuming maxMarks is 100 for simplicity as per prompt "based on 500" for 5 subjects.
    // Ideally we sum maxMarks of considered subjects.
    const totalMax = consideredSubjects.reduce((sum, sub) => sum + (sub.maxMarks || 100), 0);

    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    return {
      totalObtained,
      totalMax,
      percentage: parseFloat(percentage.toFixed(2)),
      consideredSubjects,
      discardedSubjects,
    };
  }
}
