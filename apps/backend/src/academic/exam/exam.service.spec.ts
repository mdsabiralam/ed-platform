import { Test, TestingModule } from '@nestjs/testing';
import { ExamService } from './exam.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('ExamService', () => {
  let service: ExamService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        {
          provide: PrismaService,
          useValue: {
            examSchedule: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ExamService>(ExamService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkScheduleConflict', () => {
    const classId = 'class-1';
    const date = new Date('2024-10-27T00:00:00Z');
    const startTime = new Date('2024-10-27T10:00:00Z');
    const duration = 60; // 10:00 - 11:00

    it('should throw ConflictException if overlap exists (overlap at start)', async () => {
      // Existing exam: 09:30 - 10:30
      const existingExam = {
        id: 'exam-1',
        classId,
        date,
        startTime: new Date('2024-10-27T09:30:00Z'),
        durationMinutes: 60,
      };

      (prisma.examSchedule.findMany as jest.Mock).mockResolvedValue([existingExam]);

      await expect(
        service.checkScheduleConflict(classId, date, startTime, duration),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if overlap exists (overlap at end)', async () => {
      // Existing exam: 10:30 - 11:30
      const existingExam = {
        id: 'exam-1',
        classId,
        date,
        startTime: new Date('2024-10-27T10:30:00Z'),
        durationMinutes: 60,
      };

      (prisma.examSchedule.findMany as jest.Mock).mockResolvedValue([existingExam]);

      await expect(
        service.checkScheduleConflict(classId, date, startTime, duration),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if overlap exists (enclosed)', async () => {
        // Existing exam: 10:15 - 10:45
        const existingExam = {
          id: 'exam-1',
          classId,
          date,
          startTime: new Date('2024-10-27T10:15:00Z'),
          durationMinutes: 30,
        };

        (prisma.examSchedule.findMany as jest.Mock).mockResolvedValue([existingExam]);

        await expect(
          service.checkScheduleConflict(classId, date, startTime, duration),
        ).rejects.toThrow(ConflictException);
      });

    it('should throw ConflictException if overlap exists (enclosing)', async () => {
        // Existing exam: 09:00 - 12:00
        const existingExam = {
          id: 'exam-1',
          classId,
          date,
          startTime: new Date('2024-10-27T09:00:00Z'),
          durationMinutes: 180,
        };

        (prisma.examSchedule.findMany as jest.Mock).mockResolvedValue([existingExam]);

        await expect(
          service.checkScheduleConflict(classId, date, startTime, duration),
        ).rejects.toThrow(ConflictException);
      });

    it('should NOT throw if no overlap (before)', async () => {
      // Existing exam: 08:00 - 09:00
      const existingExam = {
        id: 'exam-1',
        classId,
        date,
        startTime: new Date('2024-10-27T08:00:00Z'),
        durationMinutes: 60,
      };

      (prisma.examSchedule.findMany as jest.Mock).mockResolvedValue([existingExam]);

      await expect(
        service.checkScheduleConflict(classId, date, startTime, duration),
      ).resolves.not.toThrow();
    });

    it('should NOT throw if no overlap (after)', async () => {
        // Existing exam: 11:00 - 12:00
        const existingExam = {
          id: 'exam-1',
          classId,
          date,
          startTime: new Date('2024-10-27T11:00:00Z'),
          durationMinutes: 60,
        };

        (prisma.examSchedule.findMany as jest.Mock).mockResolvedValue([existingExam]);

        await expect(
          service.checkScheduleConflict(classId, date, startTime, duration),
        ).resolves.not.toThrow();
      });
  });
});
