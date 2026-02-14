import { Test, TestingModule } from '@nestjs/testing';
import { SyllabusService } from './syllabus.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Syllabus Tracker Flow', () => {
  let service: SyllabusService;
  let prisma: PrismaService;

  const mockPrisma = {
    lessonPlan: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    curriculumPlan: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyllabusService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SyllabusService>(SyllabusService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('5.J.06: should update curriculum completion when routine is completed', async () => {
    // 1. Trigger Event (Routine Complete)
    const routineId = 'r1';

    // Mock finding the Lesson Plan
    mockPrisma.lessonPlan.findFirst.mockResolvedValue({
      id: 'lp1',
      curriculumPlan: { id: 'cp1' },
    });

    // Mock finding all lessons for the plan (to check if all are done)
    mockPrisma.lessonPlan.findMany.mockResolvedValue([
      { id: 'lp1', status: 'PENDING' }, // This one is being updated now
      { id: 'lp2', status: 'COMPLETED' },
    ]);

    // Execute Listener Logic Directly
    await service.handleRoutineCompleted({ routineId });

    // Assert Lesson Plan Updated
    expect(mockPrisma.lessonPlan.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'lp1' },
      data: expect.objectContaining({ status: 'COMPLETED' }),
    }));

    // Assert Curriculum Plan Updated (Since all are now done)
    expect(mockPrisma.curriculumPlan.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'cp1' },
      data: expect.objectContaining({ status: 'COMPLETED' }),
    }));
  });
});
