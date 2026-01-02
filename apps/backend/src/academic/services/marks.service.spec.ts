import { Test, TestingModule } from '@nestjs/testing';
import { MarksService, UpdateMarkDto } from './marks.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GradingService } from './grading.service';
import { BadRequestException } from '@nestjs/common';

describe('MarksService', () => {
  let service: MarksService;
  let prisma: PrismaService;

  const mockExam = {
    id: 'exam1',
    tenantId: 'tenant1',
    maxTheory: 50,
    maxPractical: 20,
    subjectId: 'sub1',
    classId: 'class1',
  };

  const mockPrisma = {
    exam: {
      findUnique: jest.fn().mockResolvedValue(mockExam),
      findMany: jest.fn().mockResolvedValue([mockExam]),
    },
    studentMark: {
      upsert: jest.fn(),
    },
    markEntryStatus: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };

  const mockGradingService = {
      getGradingScaleForSubject: jest.fn().mockResolvedValue(null), // Default (Scholastic)
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
  });

  it('should update marks successfully', async () => {
    const dto: UpdateMarkDto = {
      studentId: 's1', examId: 'exam1', subjectId: 'sub1',
      theory: 40, practical: 15, isAbsent: false,
    };
    await service.updateMark('tenant1', dto);
    expect(prisma.studentMark.upsert).toHaveBeenCalled();
  });

  it('should throw error if marks exceed limit', async () => {
    const dto: UpdateMarkDto = {
      studentId: 's1', examId: 'exam1', subjectId: 'sub1',
      theory: 60, // Max 50
      practical: 15, isAbsent: false,
    };
    await expect(service.updateMark('tenant1', dto)).rejects.toThrow(BadRequestException);
  });

  it('should set total to 0 if absent', async () => {
    const dto: UpdateMarkDto = {
        studentId: 's1', examId: 'exam1', subjectId: 'sub1',
        theory: 40, practical: 15, isAbsent: true,
    };
    await service.updateMark('tenant1', dto);
    expect(prisma.studentMark.upsert).toHaveBeenCalledWith(expect.objectContaining({
        create: expect.objectContaining({ totalMarks: 0 }),
        update: expect.objectContaining({ totalMarks: 0 })
    }));
  });
});
