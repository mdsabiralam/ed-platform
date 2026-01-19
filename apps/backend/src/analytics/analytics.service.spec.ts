import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            studentMark: {
              findMany: jest.fn().mockResolvedValue([
                  { studentId: 's1', marks: 90, student: { firstName: 'Alice', lastName: 'A' } },
                  { studentId: 's2', marks: 80, student: { firstName: 'Bob', lastName: 'B' } },
                  { studentId: 's3', marks: 70, student: { firstName: 'Charlie', lastName: 'C' } },
                  { studentId: 's4', marks: 60, student: { firstName: 'David', lastName: 'D' } },
                  { studentId: 's5', marks: 50, student: { firstName: 'Eve', lastName: 'E' } },
              ]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should identify top 3 and bottom 3 students', async () => {
    const result = await service.getClassPerformance('exam1');

    expect(result.top3).toHaveLength(3);
    expect(result.top3[0].name).toBe('Alice A');
    expect(result.top3[0].marks).toBe(90);

    expect(result.bottom3).toHaveLength(3);
    expect(result.bottom3[0].name).toBe('Eve E'); // Reversed
    expect(result.bottom3[0].marks).toBe(50);
  });
});
