
export type GradingScaleRule = {
  minScore: number;
  maxScore: number;
  gradeLabel: string;
};

export function getGrade(score: number, rules: GradingScaleRule[]): string {
  // Sort rules descending by minScore to prioritize higher grades
  const sortedRules = [...rules].sort((a, b) => b.minScore - a.minScore);

  for (const rule of sortedRules) {
    // Check if score is within range [min, max) generally, but based on prompt:
    // 95 >= 91 -> A1.
    // 90.5 >= 91 -> False. 90.5 >= 81 -> True -> A2.
    // 32 >= 33 -> False. 32 >= 0 -> True -> E.

    if (score >= rule.minScore) {
       return rule.gradeLabel;
    }
  }
  return 'N/A';
}
