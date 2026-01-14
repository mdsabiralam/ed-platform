import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    curriculumPlan: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    section: {
      findMany: jest.fn(),
    },
    syllabusLog: {
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
                  estimatedHours: 2,
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
  });

  describe('compareSections', () => {
    it('should compare progress between sections', async () => {
      mockPrismaService.section.findMany.mockResolvedValue([
        { id: 'sec-A', name: 'A' },
        { id: 'sec-B', name: 'B' },
      ]);

      mockPrismaService.curriculumPlan.findFirst.mockResolvedValue({
        id: 'plan-1',
        chapters: [
          { topics: [{ id: 't1' }, { id: 't2' }] },
        ],
      });

      // Section A: 1 completed (50%)
      mockPrismaService.syllabusLog.findMany.mockResolvedValueOnce([
        { topicId: 't1', completionDate: new Date() }
      ]);

      // Section B: 2 completed (100%)
      mockPrismaService.syllabusLog.findMany.mockResolvedValueOnce([
        { topicId: 't1', completionDate: new Date() },
        { topicId: 't2', completionDate: new Date() }
      ]);

      const comparison = await service.compareSections('tenant-1', 'class-1', 'subj-1');

      expect(comparison).toHaveLength(2);
      expect(comparison[0].sectionName).toBe('A'); // Lower % first
      expect(comparison[0].completionPercentage).toBe(50);
      expect(comparison[1].sectionName).toBe('B');
      expect(comparison[1].completionPercentage).toBe(100);
    });
  });
});
