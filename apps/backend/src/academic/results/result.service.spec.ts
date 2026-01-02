import { Test, TestingModule } from '@nestjs/testing';
import { ResultService, SubjectScore } from './result.service';

describe('ResultService', () => {
  let service: ResultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResultService],
    }).compile();

    service = module.get<ResultService>(ResultService);
  });

  it('should calculate Best of 5 correctly', () => {
    const scores: SubjectScore[] = [
      { subjectName: 'Math', score: 90 },
      { subjectName: 'Science', score: 80 },
      { subjectName: 'English', score: 85 },
      { subjectName: 'Hindi', score: 70 },
      { subjectName: 'Social', score: 95 },
      { subjectName: 'IT', score: 60 },
    ];

    const result = service.calculateBestOf5(scores);

    // 1. The system must discard 'IT' (60)
    expect(result.discardedSubjects).toHaveLength(1);
    expect(result.discardedSubjects[0].subjectName).toBe('IT');
    expect(result.discardedSubjects[0].score).toBe(60);

    // 2. Total should be sum of the other 5
    // 90 + 80 + 85 + 70 + 95 = 420
    expect(result.totalObtained).toBe(420);

    // 3. Percentage should be calculated based on 500
    expect(result.totalMax).toBe(500);
    expect(result.percentage).toBe(84.00); // (420/500)*100 = 84

    // Verify considered subjects
    const consideredNames = result.consideredSubjects.map(s => s.subjectName);
    expect(consideredNames).toContain('Math');
    expect(consideredNames).toContain('Science');
    expect(consideredNames).toContain('English');
    expect(consideredNames).toContain('Hindi');
    expect(consideredNames).toContain('Social');
    expect(consideredNames).not.toContain('IT');

    console.log('Best of 5 Result:', result);
  });
});
