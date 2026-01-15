import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from '../analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

describe('Analytics Privacy (RLS Check)', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            subjectTeacherMapping: {
              findUnique: jest.fn(),
            },
            student: {
              findMany: jest.fn(),
            },
            studentMark: {
              findMany: jest.fn(),
              groupBy: jest.fn(),
            },
            studentActivityLog: {
                create: jest.fn(),
                groupBy: jest.fn(),
            },
            user: {
                findUnique: jest.fn()
            },
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should deny access if requesting teacher is not assigned to the subject', async () => {
    const sectionId = 'sec-1';
    const historySubjectId = 'history-1';
    const examTermId = 'term-1';

    // Authenticated as Teacher A (Math Teacher)
    const requesterUserId = 'teacher-a-user-id';

    // Mapping says History is taught by Teacher B
    const mockMapping = {
      teacher: { userId: 'teacher-b-user-id' }, // Different user
      subject: { name: 'History' },
    };

    (prisma.subjectTeacherMapping.findUnique as jest.Mock).mockResolvedValue(mockMapping);

    // Expect ForbiddenException when Teacher A tries to access History stats
    await expect(
      service.getTeacherPerformance(sectionId, historySubjectId, examTermId, requesterUserId)
    ).rejects.toThrow(ForbiddenException);
  });

  it('should allow access if requesting teacher is assigned to the subject', async () => {
    const sectionId = 'sec-1';
    const mathSubjectId = 'math-1';
    const examTermId = 'term-1';
    const requesterUserId = 'teacher-a-user-id';

    const mockMapping = {
      teacher: { userId: 'teacher-a-user-id' }, // Same user
      subject: { name: 'Math' },
    };

    (prisma.subjectTeacherMapping.findUnique as jest.Mock).mockResolvedValue(mockMapping);
    (prisma.student.findMany as jest.Mock).mockResolvedValue([]); // No students for simplicity
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ firstName: 'A', lastName: 'Teacher' });

    await expect(
      service.getTeacherPerformance(sectionId, mathSubjectId, examTermId, requesterUserId)
    ).resolves.not.toThrow();
  });
});
