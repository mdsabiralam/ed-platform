import { Test, TestingModule } from '@nestjs/testing';
import { ExamService } from './exam.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ExamService', () => {
  let service: ExamService;
  let prisma: PrismaService;

  const mockPrismaService = {
    exam: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ExamService>(ExamService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteExam', () => {
    // 6.A.10: Test Delete Protection
    it('should throw ForbiddenException if exam is locked', async () => {
      const examId = 'locked-exam-id';
      mockPrismaService.exam.findUnique.mockResolvedValue({
        id: examId,
        is_locked: true,
      });

      await expect(service.deleteExam(examId)).rejects.toThrow(ForbiddenException);
    });

    it('should delete exam if it is not locked', async () => {
      const examId = 'unlocked-exam-id';
      mockPrismaService.exam.findUnique.mockResolvedValue({
        id: examId,
        is_locked: false,
      });
      mockPrismaService.exam.delete.mockResolvedValue({ id: examId });

      await service.deleteExam(examId);
      expect(prisma.exam.delete).toHaveBeenCalledWith({ where: { id: examId } });
    });
  });
});