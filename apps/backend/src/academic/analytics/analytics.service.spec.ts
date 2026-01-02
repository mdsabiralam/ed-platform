import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    curriculumPlan: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSyllabusLagReport', () => {
    it('should return topics with lag > 10 days', async () => {
      const targetDate = new Date('2024-01-01');
      const completionDate = new Date('2024-01-15'); // 14 days lag

      mockPrismaService.curriculumPlan.findMany.mockResolvedValue([
        {
          subject: { name: 'Math' },
          class: { name: 'Class 10' },
          chapters: [
            {
              targetCompletionDate: targetDate,
              topics: [
                {
                  name: 'Algebra',
                  syllabusLogs: [
                    {
                      completionDate: completionDate,
                      section: { name: 'A' },
                      teacher: { user: { firstName: 'John', lastName: 'Doe' } },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);

      const report = await service.getSyllabusLagReport('tenant-1');
      expect(report).toHaveLength(1);
      expect(report[0].lagDays).toBe(14);
      expect(report[0].subject).toBe('Math');
      expect(report[0].suggestion).toContain('Schedule');
    });

    it('should ignore topics with lag <= 10 days', async () => {
      const targetDate = new Date('2024-01-01');
      const completionDate = new Date('2024-01-05'); // 4 days lag

      mockPrismaService.curriculumPlan.findMany.mockResolvedValue([
        {
          subject: { name: 'Math' },
          class: { name: 'Class 10' },
          chapters: [
            {
              targetCompletionDate: targetDate,
              topics: [
                {
                  name: 'Algebra',
                  syllabusLogs: [
                    {
                      completionDate: completionDate,
                      section: { name: 'A' },
                      teacher: { user: { firstName: 'John', lastName: 'Doe' } },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);

      const report = await service.getSyllabusLagReport('tenant-1');
      expect(report).toHaveLength(0);
    });
  });
});
