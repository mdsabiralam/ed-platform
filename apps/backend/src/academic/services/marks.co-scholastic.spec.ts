import { Test, TestingModule } from '@nestjs/testing';
import { MarksService, UpdateMarkDto } from './marks.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GradingService } from './grading.service';
import { BadRequestException } from '@nestjs/common';

describe('MarksService - Co-Scholastic', () => {
  let service: MarksService;
  let prisma: PrismaService;
  let gradingService: GradingService;

  const mockExam = {
    id: 'exam1',
    tenantId: 'tenant1',
    subjectId: 'sub1',
    classId: 'class1',
    maxTheory: 100,
    maxPractical: 0,
  };

  const mockCoScholasticScale = {
      isMarksBased: false,
      gradingLogics: [
          { label: 'A', minScore: null, maxScore: null, gradePoint: 5 },
          { label: 'B', minScore: null, maxScore: null, gradePoint: 4 },
      ]
  };

  const mockScholasticScale = {
      isMarksBased: true,
      gradingLogics: []
  };

  const mockPrisma = {
    exam: {
      findUnique: jest.fn().mockResolvedValue(mockExam),
      findMany: jest.fn().mockResolvedValue([mockExam]),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    studentMark: {
      upsert: jest.fn(),
    },
    markEntryStatus: {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
    },
    student: {
        findMany: jest.fn().mockResolvedValue([
            { id: 's1', section: { classId: 'class1' } }
        ])
    }
  };

  const mockGradingService = {
      getGradingScaleForSubject: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarksService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GradingService, useValue: mockGradingService },
      ],
    }).compile();

    service = module.get<MarksService>(MarksService);
    prisma = module.get<PrismaService>(PrismaService);
    gradingService = module.get<GradingService>(GradingService);
  });

  it('should accept gradeLabel for co-scholastic subject', async () => {
    mockGradingService.getGradingScaleForSubject.mockResolvedValue(mockCoScholasticScale);

    const dto: UpdateMarkDto = {
      studentId: 's1', examId: 'exam1', subjectId: 'sub1',
      theory: 0, practical: 0, isAbsent: false,
      gradeLabel: 'A'
    };

    await service.updateMark('tenant1', dto);

    expect(prisma.studentMark.upsert).toHaveBeenCalledWith(expect.objectContaining({
        create: expect.objectContaining({ gradeLabel: 'A', totalMarks: 0 }),
    }));
  });

  it('should reject invalid gradeLabel for co-scholastic subject', async () => {
    mockGradingService.getGradingScaleForSubject.mockResolvedValue(mockCoScholasticScale);

    const dto: UpdateMarkDto = {
      studentId: 's1', examId: 'exam1', subjectId: 'sub1',
      theory: 0, practical: 0, isAbsent: false,
      gradeLabel: 'X' // Invalid
    };

    await expect(service.updateMark('tenant1', dto)).rejects.toThrow(BadRequestException);
  });

  it('should reject numeric marks if missing gradeLabel for co-scholastic', async () => {
    mockGradingService.getGradingScaleForSubject.mockResolvedValue(mockCoScholasticScale);

    const dto: UpdateMarkDto = {
      studentId: 's1', examId: 'exam1', subjectId: 'sub1',
      theory: 50, practical: 0, isAbsent: false,
      // gradeLabel missing
    };

    await expect(service.updateMark('tenant1', dto)).rejects.toThrow(BadRequestException);
  });

  it('should ignore gradeLabel for scholastic subject', async () => {
    mockGradingService.getGradingScaleForSubject.mockResolvedValue(mockScholasticScale);

    const dto: UpdateMarkDto = {
      studentId: 's1', examId: 'exam1', subjectId: 'sub1',
      theory: 80, practical: 0, isAbsent: false,
      gradeLabel: 'A' // Should be ignored or set to null
    };

    await service.updateMark('tenant1', dto);

    expect(prisma.studentMark.upsert).toHaveBeenCalledWith(expect.objectContaining({
        create: expect.objectContaining({ gradeLabel: null, totalMarks: 80 }),
    }));
  });
});
