import { Test, TestingModule } from '@nestjs/testing';
import { MarksService, UpdateMarkDto } from './marks.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

describe('MarksService Concurrency/Locking', () => {
  let service: MarksService;
  let prisma: PrismaService;

  const mockExam = { id: 'exam1', tenantId: 'tenant1', maxTheory: 100, maxPractical: 0 };

  const mockPrisma = {
    exam: {
      findUnique: jest.fn().mockResolvedValue(mockExam),
      findMany: jest.fn().mockResolvedValue([mockExam]),
    },
    markEntryStatus: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
    },
    studentMark: {
        upsert: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MarksService>(MarksService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should allow update if status is DRAFT or null', async () => {
      mockPrisma.markEntryStatus.findUnique.mockResolvedValue(null);
      const dto: UpdateMarkDto = { studentId: 's1', examId: 'exam1', subjectId: 'sub1', theory: 50, practical: 0, isAbsent: false };
      await expect(service.updateMark('tenant1', dto)).resolves.not.toThrow();
  });

  it('should block update if status is PENDING_APPROVAL', async () => {
      mockPrisma.markEntryStatus.findUnique.mockResolvedValue({ status: 'PENDING_APPROVAL' });
      const dto: UpdateMarkDto = { studentId: 's1', examId: 'exam1', subjectId: 'sub1', theory: 50, practical: 0, isAbsent: false };
      await expect(service.updateMark('tenant1', dto)).rejects.toThrow(ForbiddenException);
  });

  it('should block update if status is APPROVED', async () => {
      mockPrisma.markEntryStatus.findUnique.mockResolvedValue({ status: 'APPROVED' });
      const dto: UpdateMarkDto = { studentId: 's1', examId: 'exam1', subjectId: 'sub1', theory: 50, practical: 0, isAbsent: false };
      await expect(service.updateMark('tenant1', dto)).rejects.toThrow(ForbiddenException);
  });
});
