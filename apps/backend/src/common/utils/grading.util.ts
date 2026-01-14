export interface GradingScaleRule {
  min: number;
  max: number;
  grade: string;
  description?: string;
}

/**
 * Calculates the grade for a given score based on the provided rules.
 * @param score The numerical score to grade.
 * @param rules An array of GradingScaleRule objects.
 * @returns The grade label (e.g., 'A1', 'B2', 'E') or 'N/A' if no rule matches.
 *
 * Note: The score is floored to the nearest integer to match grading expectations
 * where 90.5 should fall into the 81-90 bucket (A2) rather than rounding up to 91 (A1).
 */
export function getGrade(score: number, rules: GradingScaleRule[]): string {
  const roundedScore = Math.floor(score);

  for (const rule of rules) {
    if (roundedScore >= rule.min && roundedScore <= rule.max) {
      return rule.grade;
    }
  }

  return 'F';
}
