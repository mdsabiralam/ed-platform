import { Test, TestingModule } from '@nestjs/testing';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TrainingModule', () => {
  let controller: TrainingController;
  let service: TrainingService;
  let prisma: PrismaService;

  const mockPrismaService = {
    teacherTraining: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    trainingAttendance: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingController],
      providers: [
        TrainingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<TrainingController>(TrainingController);
    service = module.get<TrainingService>(TrainingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a training session', async () => {
      const dto = {
        title: 'Test Training',
        description: 'Test Description',
        date: '2025-12-25T10:00:00Z',
        durationHours: 2,
        resourcePerson: 'Dr. Test',
        resourceUrls: ['http://test.com'],
        schoolId: 'school-123',
      };

      const expectedResult = { id: 'uuid', ...dto, date: new Date(dto.date), tenantId: dto.schoolId };
      mockPrismaService.teacherTraining.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(prisma.teacherTraining.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          date: new Date(dto.date),
          durationHours: dto.durationHours,
          resourcePerson: dto.resourcePerson,
          resourceUrls: dto.resourceUrls,
          tenantId: dto.schoolId,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUpcoming', () => {
    it('should return upcoming trainings filtered by schoolId', async () => {
      const schoolId = 'school-123';
      const mockTrainings = [
        { id: '1', title: 'Future Training', date: new Date('2026-01-01'), tenantId: schoolId },
      ];

      mockPrismaService.teacherTraining.findMany.mockResolvedValue(mockTrainings);

      const result = await controller.getUpcoming(schoolId);

      expect(prisma.teacherTraining.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: schoolId,
          date: { gt: expect.any(Date) },
        },
        orderBy: { date: 'asc' },
      });
      expect(result).toEqual(mockTrainings);
    });

    it('should throw BadRequestException if schoolId is missing', async () => {
        await expect(controller.getUpcoming('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitFeedback', () => {
    it('should update feedback for existing attendance', async () => {
      const dto = { attendanceId: 'att-1', score: 5, comments: 'Great!' };
      const mockAttendance = { id: 'att-1' };

      mockPrismaService.trainingAttendance.findUnique.mockResolvedValue(mockAttendance);
      mockPrismaService.trainingAttendance.update.mockResolvedValue({ ...mockAttendance, feedbackScore: 5 });

      await controller.submitFeedback(dto);

      expect(prisma.trainingAttendance.findUnique).toHaveBeenCalledWith({ where: { id: dto.attendanceId } });
      expect(prisma.trainingAttendance.update).toHaveBeenCalledWith({
        where: { id: dto.attendanceId },
        data: { feedbackScore: dto.score, feedbackComments: dto.comments },
      });
    });

    it('should throw NotFoundException if attendance record missing', async () => {
       const dto = { attendanceId: 'att-2', score: 5 };
       mockPrismaService.trainingAttendance.findUnique.mockResolvedValue(null);

       await expect(controller.submitFeedback(dto)).rejects.toThrow(NotFoundException);
    });
  });
});
