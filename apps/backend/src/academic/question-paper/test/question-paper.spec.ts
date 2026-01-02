import { Test, TestingModule } from '@nestjs/testing';
import { QuestionPaperService } from '../question-paper.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { QuestionType, DifficultyLevel } from '@prisma/client';

describe('QuestionPaperService', () => {
  let service: QuestionPaperService;
  let prisma: PrismaService;

  const mockPrismaService = {
    questionBlueprint: {
      findUnique: jest.fn(),
    },
    generatedPaper: {
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionPaperService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<QuestionPaperService>(QuestionPaperService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should generate a paper with correct total marks', async () => {
    const blueprintId = 'bp-1';
    const classId = 'class-1';
    const chapterIds = ['ch-1'];

    const mockBlueprint = {
      id: blueprintId,
      subjectId: 'sub-1',
      totalMarks: 50,
      structure: [
        { type: QuestionType.MCQ, count: 10, marks: 1 }, // 10 * 1 = 10 marks
        { type: QuestionType.SHORT_ANSWER, count: 5, marks: 4 }, // 5 * 4 = 20 marks
        { type: QuestionType.LONG_ANSWER, count: 2, marks: 10 }, // 2 * 10 = 20 marks
        // Total: 10 + 20 + 20 = 50
      ],
      difficultyDistribution: {
        EASY: 50,
        MEDIUM: 30,
        HARD: 20,
      },
    };

    mockPrismaService.questionBlueprint.findUnique.mockResolvedValue(mockBlueprint);
    mockPrismaService.generatedPaper.findMany.mockResolvedValue([]); // No past papers

    // Mock $queryRaw to return appropriate questions based on calls
    // The service calls $queryRaw in a loop. We need to simulate returns.
    // For simplicity, we can just return an array of "Questions" that matches the requested count.

    // We can use mockImplementation to inspect arguments and return valid questions
    mockPrismaService.$queryRaw.mockImplementation((query, ...args) => {
      // console.log('Mock $queryRaw called with args:', args);

      // Helper to find type in args
      const typeArg = args.find(arg => Object.values(QuestionType).includes(arg as any));
      let marks = 0;
      if (typeArg === QuestionType.MCQ) marks = 1;
      else if (typeArg === QuestionType.SHORT_ANSWER) marks = 4;
      else if (typeArg === QuestionType.LONG_ANSWER) marks = 10;

      // Identify Limit: The logic in service puts limit as the last argument.
      // It is a number.
      let limit = 1;
      for (let i = args.length - 1; i >= 0; i--) {
        if (typeof args[i] === 'number') {
            limit = args[i];
            break;
        }
      }

      // Generate dummy questions
      const result = [];
      for (let i = 0; i < limit; i++) {
        result.push({
            id: 'q-' + Math.random(),
            type: typeArg,
            marks: marks,
        });
      }

      return Promise.resolve(result);
    });

    const questions = await service.generatePaper(blueprintId, classId, chapterIds);

    const totalMarksGenerated = questions.reduce((sum, q) => sum + q.marks, 0);

    expect(totalMarksGenerated).toBe(mockBlueprint.totalMarks);
  });
});
