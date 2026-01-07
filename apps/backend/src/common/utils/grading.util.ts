
export interface GradingScaleRule {
  min: number;
  max: number;
  grade: string;
  description?: string;
}

export function getGrade(score: number, rules: GradingScaleRule[]): string {
  // Use floor logic as per memory and standard requirement
  const processedScore = Math.floor(score);

  for (const rule of rules) {
    if (processedScore >= rule.min && processedScore <= rule.max) {
      return rule.grade;
    }
  }
  return 'F';
}
