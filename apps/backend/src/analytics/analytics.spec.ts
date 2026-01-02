import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AnalyticsModule', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    teacherTraining: {
      findUnique: jest.fn(),
    },
    classObservation: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTrainingImpact', () => {
    it('should calculate improvement correctly', async () => {
      const trainingId = 't-1';
      const mockTraining = {
        id: trainingId,
        date: new Date('2025-06-01'),
        attendances: [
          {
            staffId: 'staff-1',
            staff: { user: { firstName: 'John', lastName: 'Doe' } },
          },
        ],
      };

      const preObservations = [{ rating: 3.0 }, { rating: 3.5 }]; // Avg: 3.25
      const postObservations = [{ rating: 4.0 }, { rating: 4.5 }]; // Avg: 4.25

      mockPrismaService.teacherTraining.findUnique.mockResolvedValue(mockTraining);
      mockPrismaService.classObservation.findMany
        .mockResolvedValueOnce(preObservations) // First call: pre
        .mockResolvedValueOnce(postObservations); // Second call: post

      const result = await controller.getTrainingImpact(trainingId);

      expect(prisma.teacherTraining.findUnique).toHaveBeenCalledWith({
        where: { id: trainingId },
        include: expect.any(Object),
      });
      expect(result).toHaveLength(1);
      expect(result[0].staffName).toBe('John Doe');
      expect(result[0].preTrainingRating).toBe(3.25);
      expect(result[0].postTrainingRating).toBe(4.25);
      expect(result[0].improvement).toBe(true);
    });

    it('should throw NotFound if training missing', async () => {
      mockPrismaService.teacherTraining.findUnique.mockResolvedValue(null);
      await expect(controller.getTrainingImpact('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
