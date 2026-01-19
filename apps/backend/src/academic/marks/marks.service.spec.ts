import { Test, TestingModule } from '@nestjs/testing';
import { MarksService } from './marks.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MarksService', () => {
  let service: MarksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarksService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn().mockImplementation((cb) => cb({
                studentMark: {
                    create: jest.fn(),
                }
            })),
            studentMark: {
              create: jest.fn(),
            },
            exam: {
                findUnique: jest.fn().mockResolvedValue({ maxMarks: 100 }),
            }
          },
        },
      ],
    }).compile();

    service = module.get<MarksService>(MarksService);
  });

  it('should throw error if marks exceed max marks', async () => {
    const dto = {
      records: [
        { studentId: '1', examId: 'ex1', subject: 'Math', marks: 105 },
      ],
    };

    await expect(service.recordBulk(dto)).rejects.toThrow(
      'Marks for student 1 cannot exceed 100. Given: 105',
    );
  });

  it('should save valid marks', async () => {
    const dto = {
        records: [
          { studentId: '1', examId: 'ex1', subject: 'Math', marks: 95 },
        ],
      };

      const result = await service.recordBulk(dto);
      expect(result.success).toBe(true);
  });
});
