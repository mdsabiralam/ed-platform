import { Test, TestingModule } from '@nestjs/testing';
import { HomeworkService } from './homework.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('Homework End-to-End Flow', () => {
  let service: HomeworkService;
  let prisma: PrismaService;

  const mockPrisma = {
    homework: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    homeworkSubmission: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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

  it('5.J.04: should execute full homework lifecycle', async () => {
    // 1. Assign
    const assignDto = {
      classId: 'c1',
      subjectId: 's1',
      teacherId: 't1',
      title: 'Math HW',
      dueDate: new Date().toISOString(),
    };
    mockPrisma.homework.create.mockResolvedValue({ id: 'hw1', ...assignDto });

    const assigned = await service.assign(assignDto);
    expect(assigned.id).toBe('hw1');

    // 2. Submit
    const submitDto = {
      homeworkId: 'hw1',
      studentId: 'stu1',
      fileUrl: 'http://file.com',
    };
    mockPrisma.homework.findUnique.mockResolvedValue({ id: 'hw1' }); // Found
    mockPrisma.homeworkSubmission.create.mockResolvedValue({
      id: 'sub1',
      status: 'SUBMITTED',
      ...submitDto,
    });

    const submitted = await service.submit(submitDto);
    expect(submitted.status).toBe('SUBMITTED');

    // 3. Grade
    const gradeDto = {
      submissionId: 'sub1',
      grade: 5,
    };
    mockPrisma.homeworkSubmission.findUnique.mockResolvedValue({ id: 'sub1' }); // Found
    mockPrisma.homeworkSubmission.update.mockResolvedValue({
      id: 'sub1',
      status: 'GRADED',
      grade: 5,
    });

    const graded = await service.grade(gradeDto);
    expect(graded.status).toBe('GRADED');
    expect(graded.grade).toBe(5);
  });
});
