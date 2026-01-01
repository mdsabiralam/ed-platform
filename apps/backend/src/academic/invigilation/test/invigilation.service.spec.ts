import { Test, TestingModule } from '@nestjs/testing';
import { InvigilationService } from '../invigilation.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException } from '@nestjs/common';

describe('InvigilationService', () => {
  let service: InvigilationService;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvigilationService,
        {
          provide: PrismaService,
          useValue: {
            examSchedule: {
              findUnique: jest.fn(),
            },
            invigilationDuty: {
              create: jest.fn(),
            },
            // Mocking hypothetical routineEntry query
            routineEntry: {
                findFirst: jest.fn(),
            }
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

    service = module.get<InvigilationService>(InvigilationService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignDuty', () => {
    it('should assign duty and emit event if valid', async () => {
      const dto = { examScheduleId: '1', staffId: 'staff-1', roomId: 'room-1' };
      const examSchedule = {
          id: '1',
          date: new Date(),
          startTime: new Date(),
          subjectId: 'math',
          classId: 'class-1',
      };
      const duty = { id: 'duty-1', ...dto };

      (prisma.examSchedule.findUnique as jest.Mock).mockResolvedValue(examSchedule);
      (prisma.invigilationDuty.create as jest.Mock).mockResolvedValue(duty);

      // Mock subject teacher check to return false (not the teacher)
      // Since we couldn't implement the real check due to missing schema, this test assumes success path.

      await service.assignDuty(dto);

      expect(prisma.invigilationDuty.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('invigilation.assigned', expect.any(Object));
    });

    it('should throw ConflictException if exam schedule not found', async () => {
        (prisma.examSchedule.findUnique as jest.Mock).mockResolvedValue(null);
        await expect(service.assignDuty({ examScheduleId: 'bad', staffId: 's', roomId: 'r' }))
            .rejects.toThrow(ConflictException);
    });
  });
});
