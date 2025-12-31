// 6.A.10: Test Delete Protection
// This unit test validates that an exam cannot be deleted if it is locked.

import { Test, TestingModule } from '@nestjs/testing';
import { ExamService } from './exam.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ExamService - Delete Protection', () => {
  let service: ExamService;
  let prisma: PrismaService;

  const mockPrisma = {
    exam: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    student: { findUnique: jest.fn() },
    examGroup: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExamService>(ExamService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should prevent deleting a locked exam', async () => {
    const examId = 'locked-exam-id';

    // Mock finding a locked exam
    mockPrisma.exam.findUnique.mockResolvedValue({
      id: examId,
      tenantId: 'tenant-1',
      isLocked: true, // LOCKED
    });

    // Expectation: Should throw BadRequestException
    await expect(service.deleteExam(examId, 'tenant-1')).rejects.toThrow(BadRequestException);
    expect(mockPrisma.exam.delete).not.toHaveBeenCalled();
  });

  it('should allow deleting an unlocked exam', async () => {
    const examId = 'unlocked-exam-id';

    // Mock finding an UNLOCKED exam
    mockPrisma.exam.findUnique.mockResolvedValue({
      id: examId,
      tenantId: 'tenant-1',
      isLocked: false,
    });

    mockPrisma.exam.delete.mockResolvedValue({ id: examId });

    // Expectation: Should succeed
    await expect(service.deleteExam(examId, 'tenant-1')).resolves.toEqual({ id: examId });
    expect(mockPrisma.exam.delete).toHaveBeenCalledWith({ where: { id: examId } });
  });
});
