// 5.J.04: End-to-End Homework Flow Test (Manual/Integration Script)
// Note: This script simulates the flow as unit tests due to environment constraints for full E2E setup.
// It verifies the service logic flow: Assign -> Submit -> Grade.

import { Test, TestingModule } from '@nestjs/testing';
import { HomeworkService } from './homework.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Homework E2E Flow', () => {
  let service: HomeworkService;
  let prisma: PrismaService;

  const mockPrisma = {
    homework: {
      create: jest.fn().mockResolvedValue({ id: 'hw-1', title: 'Math HW' }),
      findUnique: jest.fn().mockResolvedValue({ id: 'hw-1', title: 'Math HW' }),
    },
    homeworkSubmission: {
      upsert: jest.fn().mockResolvedValue({ id: 'sub-1', status: 'SUBMITTED' }),
      findUnique: jest.fn().mockResolvedValue({ id: 'sub-1', status: 'SUBMITTED' }),
      update: jest.fn().mockResolvedValue({ id: 'sub-1', status: 'GRADED', grade: 'A' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeworkService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<HomeworkService>(HomeworkService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should complete the full homework lifecycle', async () => {
    // 1. Assign
    const homework = await service.assignHomework('tenant-1', {
      title: 'Math HW',
      description: 'Solve page 10',
      dueDate: '2023-12-31',
      sectionId: 'sec-1',
      subjectId: 'sub-1',
      teacherId: 'teacher-1',
    });
    expect(homework.id).toBe('hw-1');

    // 2. Submit
    const submission = await service.submitHomework('student-1', 'hw-1', 'http://link.to/pdf');
    expect(submission.status).toBe('SUBMITTED');

    // 3. Grade
    const graded = await service.gradeHomework('hw-1', 'student-1', 'A', 'Good job');
    expect(graded.status).toBe('GRADED');
    expect(graded.grade).toBe('A');
  });
});
