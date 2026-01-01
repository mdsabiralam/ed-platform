import { Test, TestingModule } from '@nestjs/testing';
import { ExamController } from '../../../src/academic/exam/exam.controller';
import { ExamService } from '../../../src/academic/exam/exam.service';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('ExamController', () => {
  let controller: ExamController;
  let service: ExamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamController],
      providers: [
        {
          provide: ExamService,
          useValue: {
            getSchedules: jest.fn().mockResolvedValue([
              {
                id: '1',
                startTime: new Date('2025-01-01T10:00:00Z'),
                subject: { name: 'Math' },
                exam: { name: 'Midterm' },
              },
            ]),
            createSchedules: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExamController>(ExamController);
    service = module.get<ExamService>(ExamService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSchedules', () => {
    it('should return schedules for a class', async () => {
      const result = await controller.getSchedules('class-123');
      expect(result).toHaveLength(1);
      expect(service.getSchedules).toHaveBeenCalledWith('class-123');
    });
  });
});
