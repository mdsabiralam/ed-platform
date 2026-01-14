import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma/prisma.service';
import { getGrade } from './common/utils/grading.util';

describe('Grading Verification', () => {
  let prismaService: PrismaService;

  const mockRules = [
    { minScore: 91, maxScore: 100, gradeLabel: 'A1' },
    { minScore: 81, maxScore: 91, gradeLabel: 'A2' },
    { minScore: 71, maxScore: 81, gradeLabel: 'B1' },
    { minScore: 61, maxScore: 71, gradeLabel: 'B2' },
    { minScore: 51, maxScore: 61, gradeLabel: 'C1' },
    { minScore: 41, maxScore: 51, gradeLabel: 'C2' },
    { minScore: 33, maxScore: 41, gradeLabel: 'D' },
    { minScore: 0, maxScore: 33, gradeLabel: 'E' },
  ];

  const mockScale = {
    name: 'CBSE Standard',
    rules: mockRules,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
      ],
    })
    .overrideProvider(PrismaService)
    .useValue({
      gradingScale: {
        findFirst: jest.fn().mockResolvedValue(mockScale),
      },
    })
    .compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should fetch the CBSE Standard scale and correctly map scores', async () => {
    // 1. Fetch the scale (mocked)
    const scale = await prismaService.gradingScale.findFirst({
        where: { name: 'CBSE Standard' },
        include: { rules: true }
    });

    expect(scale).toBeDefined();
    expect(scale.name).toBe('CBSE Standard');

    // 2. Test Inputs using shared logic
    // We map the mock rules to the expected type if strictly needed,
    // but JS duck typing works here as the shape matches.
    const rules = scale.rules.map(r => ({
        minScore: r.minScore,
        maxScore: r.maxScore,
        gradeLabel: r.gradeLabel
    }));

    expect(getGrade(95, rules)).toBe('A1');
    expect(getGrade(32, rules)).toBe('E');
    expect(getGrade(90.5, rules)).toBe('A2');

    console.log('Verification Results:');
    console.log(`Input: 95 -> ${getGrade(95, rules)} (Expected: A1)`);
    console.log(`Input: 32 -> ${getGrade(32, rules)} (Expected: E)`);
    console.log(`Input: 90.5 -> ${getGrade(90.5, rules)} (Expected: A2)`);
  });
});
