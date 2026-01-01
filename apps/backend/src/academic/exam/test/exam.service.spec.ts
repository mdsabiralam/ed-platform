import { Test, TestingModule } from '@nestjs/testing';
import { ExamService } from '../exam.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException } from '@nestjs/common';

describe('ExamService', () => {
  let service: ExamService;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        {
          provide: PrismaService,
          useValue: {
            examSchedule: {
              findUnique: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
            $transaction: jest.fn((cb) => cb({ examSchedule: { findMany: jest.fn(), create: jest.fn() } })),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExamService>(ExamService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('rescheduleExam', () => {
    const id = 'schedule-1';
    const dto = {
      date: '2025-01-02',
      time: '2025-01-02T10:00:00Z',
      duration: 60,
    };
    const examSchedule = {
      id,
      classId: 'class-1',
      subject: { name: 'Math' },
    };

    it('should reschedule exam successfully', async () => {
      (prisma.examSchedule.findUnique as jest.Mock).mockResolvedValue(examSchedule);
      (prisma.examSchedule.findMany as jest.Mock).mockResolvedValue([]); // No conflicts
      (prisma.examSchedule.update as jest.Mock).mockResolvedValue({ ...examSchedule, ...dto });

      await service.rescheduleExam(id, dto);

      expect(prisma.examSchedule.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          date: expect.any(Date),
          startTime: expect.any(Date),
          durationMinutes: dto.duration,
        },
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('exam.rescheduled', expect.any(Object));
    });

    it('should throw ConflictException if conflict found (excluding self)', async () => {
      (prisma.examSchedule.findUnique as jest.Mock).mockResolvedValue(examSchedule);
      // Mock conflict return
      (prisma.examSchedule.findMany as jest.Mock).mockResolvedValue([{
          id: 'other-exam',
          startTime: new Date('2025-01-02T10:00:00Z'),
          durationMinutes: 60,
      }]);

      await expect(service.rescheduleExam(id, dto)).rejects.toThrow(ConflictException);
    });
  });
});
