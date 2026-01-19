import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prisma: PrismaService;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn().mockImplementation((cb) => cb({
                attendance: {
                    create: jest.fn(),
                }
            })),
            attendance: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    prisma = module.get<PrismaService>(PrismaService);
    // Mock private logger
    loggerSpy = jest.spyOn((service as any).logger, 'log').mockImplementation();
  });

  it('should mark attendance and send SMS for absent students', async () => {
    const dto = {
      records: [
        { studentId: '1', date: '2023-10-27', status: 'PRESENT' },
        { studentId: '2', date: '2023-10-27', status: 'ABSENT' },
      ],
    };

    const result = await service.markBulk(dto);

    expect(result.count).toBe(2);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('SMS Notification sent to parent of student 2')
    );
    expect(loggerSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('SMS Notification sent to parent of student 1')
    );
  });
});
