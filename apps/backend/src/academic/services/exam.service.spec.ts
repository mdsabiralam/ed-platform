import { Test, TestingModule } from '@nestjs/testing';
import { ExamService } from './exam.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ExamService', () => {
  let service: ExamService;
  let prisma: PrismaService;

  const mockExamId = 'exam-uuid';

  const mockPrismaService = {
    exam: {
      findUnique: jest.fn(),
      delete: jest.fn(),
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
    it('should throw NotFoundException if exam does not exist', async () => {
      mockPrismaService.exam.findUnique.mockResolvedValue(null);

      await expect(service.deleteExam('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if exam has marks entered', async () => {
      mockPrismaService.exam.findUnique.mockResolvedValue({
        id: mockExamId,
        _count: { marks: 5 }, // 5 student marks exist
      });

      await expect(service.deleteExam(mockExamId)).rejects.toThrow(BadRequestException);
      await expect(service.deleteExam(mockExamId)).rejects.toThrow('Cannot delete exam with entered marks.');
    });

    it('should delete exam if no marks entered', async () => {
      mockPrismaService.exam.findUnique.mockResolvedValue({
        id: mockExamId,
        _count: { marks: 0 },
      });
      mockPrismaService.exam.delete.mockResolvedValue({ id: mockExamId });

      const result = await service.deleteExam(mockExamId);
      expect(result).toEqual({ id: mockExamId });
      expect(mockPrismaService.exam.delete).toHaveBeenCalledWith({ where: { id: mockExamId } });
    });
  });
});
