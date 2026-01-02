import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { QuestionType, DifficultyLevel, Question, Prisma } from '@prisma/client';

interface BlueprintStructureItem {
  type: QuestionType;
  count: number;
  marks: number;
}

interface DifficultyDistribution {
  [key: string]: number; // Percentage, e.g., { EASY: 40, MEDIUM: 40, HARD: 20 }
}

@Injectable()
export class QuestionPaperService {
  constructor(private prisma: PrismaService) {}

  async generatePaper(blueprintId: string, chapterIds: string[]): Promise<Question[]> {
    // 1. Fetch the Blueprint
    const blueprint = await this.prisma.questionBlueprint.findUnique({
      where: { id: blueprintId },
    });

    if (!blueprint) {
      throw new NotFoundException('Question Blueprint not found');
    }

    const structure = blueprint.structure as unknown as BlueprintStructureItem[];
    const difficultyDist = blueprint.difficultyDistribution as unknown as DifficultyDistribution;

    let selectedQuestions: Question[] = [];

    // 2. Loop through the structure
    for (const item of structure) {
      const { type, count } = item;

      // Calculate count per difficulty based on distribution
      // Default to equal distribution if difficultyDist is missing or invalid, or handle strictly?
      // For now, let's try to adhere to the distribution percentages.

      const difficultyCounts = {
        EASY: Math.round((count * (difficultyDist['EASY'] || 0)) / 100),
        MEDIUM: Math.round((count * (difficultyDist['MEDIUM'] || 0)) / 100),
        HARD: Math.round((count * (difficultyDist['HARD'] || 0)) / 100),
      };

      // Adjust for rounding errors to ensure total matches 'count'
      const totalDistributed = difficultyCounts.EASY + difficultyCounts.MEDIUM + difficultyCounts.HARD;
      if (totalDistributed < count) {
        difficultyCounts.EASY += (count - totalDistributed); // Dump remainder in EASY
      } else if (totalDistributed > count) {
         if (difficultyCounts.EASY > (totalDistributed - count)) {
             difficultyCounts.EASY -= (totalDistributed - count);
         }
      }

      // 3. Fetch questions for each difficulty
      for (const difficulty of Object.keys(difficultyCounts)) {
        const requiredCount = difficultyCounts[difficulty];
        if (requiredCount <= 0) continue;

        const diffEnum = difficulty as DifficultyLevel;

        // Use Prisma raw query ORDER BY RANDOM()
        // Note: chapterIds array needs to be handled in raw query carefully.
        // We can use IN clause with parameterized query.

        const questions = await this.prisma.$queryRaw<Question[]>`
          SELECT * FROM "questions"
          WHERE "subject_id" = ${blueprint.subjectId}
          AND "chapter_id" IN (${Prisma.join(chapterIds)})
          AND "type"::text = ${type}
          AND "difficulty"::text = ${diffEnum}
          ORDER BY RANDOM()
          LIMIT ${requiredCount}
        `;

        if (questions.length < requiredCount) {
             // Fallback strategy could be implemented here (e.g. fetch from other difficulties),
             // but strictly we just return what we found or warn.
             // For now, we append what we found.
        }

        selectedQuestions = [...selectedQuestions, ...questions];
      }
    }

    return selectedQuestions;
  }
}
