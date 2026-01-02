
export interface SubjectScore {
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  isAbsent?: boolean;
}

export interface AggregationResult {
  totalMarks: number;
  percentage: number;
  consideredSubjects: string[];
  discardedSubjects: string[];
}

export class ResultService {
  /**
   * Calculates the result based on "Best of 5" logic.
   * Logic:
   * 1. Sort subjects by marks obtained (descending).
   * 2. Take top 5 subjects.
   * 3. Calculate total marks obtained in these 5.
   * 4. Calculate percentage = (Total Obtained / Total Max Marks of these 5) * 100.
   *
   * @param scores List of subject scores
   * @returns AggregationResult
   */
  calculateBestOf5(scores: SubjectScore[]): AggregationResult {
    // Basic validation
    if (!scores || scores.length === 0) {
      return {
        totalMarks: 0,
        percentage: 0,
        consideredSubjects: [],
        discardedSubjects: [],
      };
    }

    // Sort by marksObtained descending
    // Note: If maxMarks differ significantly, this logic might need adjustment (e.g., sort by percentage),
    // but typically "Best of 5" implies subjects have equal weight/max marks (usually 100).
    // The prompt implies discarding the lowest score (60 vs 90, 80, etc.), assuming equal max marks.
    const sortedScores = [...scores].sort((a, b) => b.marksObtained - a.marksObtained);

    const considered = sortedScores.slice(0, 5);
    const discarded = sortedScores.slice(5);

    const totalObtained = considered.reduce((sum, s) => sum + s.marksObtained, 0);
    const totalMax = considered.reduce((sum, s) => sum + s.maxMarks, 0);

    // Avoid division by zero
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    return {
      totalMarks: totalObtained,
      percentage: parseFloat(percentage.toFixed(2)), // Round to 2 decimal places
      consideredSubjects: considered.map((s) => s.subjectName),
      discardedSubjects: discarded.map((s) => s.subjectName),
    };
  }
}
