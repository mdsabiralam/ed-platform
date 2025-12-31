import { Test, TestingModule } from '@nestjs/testing';
import { TimetableService } from './timetable.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('TimetableService Validation', () => {
  let service: TimetableService;
  let prisma: PrismaService;

  const mockPrisma = {
    routineEntry: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimetableService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TimetableService>(TimetableService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('validateConflict', () => {
    it('should throw ConflictException if teacher is busy', async () => {
      // Setup
      mockPrisma.routineEntry.findFirst.mockResolvedValueOnce({ id: 'existing-entry' }); // Teacher busy check

      // Execute & Assert
      await expect(
        service.validateConflict('teacher-A', 'class-5B', 'MON', 'slot-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if class is busy', async () => {
      // Setup
      mockPrisma.routineEntry.findFirst.mockResolvedValueOnce(null); // Teacher free
      mockPrisma.routineEntry.findFirst.mockResolvedValueOnce({ id: 'existing-class-entry' }); // Class busy

      // Execute & Assert
      await expect(
        service.validateConflict('teacher-A', 'class-5B', 'MON', 'slot-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should return true if no conflict', async () => {
      // Setup
      mockPrisma.routineEntry.findFirst.mockResolvedValue(null); // Both free

      // Execute & Assert
      await expect(
        service.validateConflict('teacher-A', 'class-5B', 'MON', 'slot-1'),
      ).resolves.toBe(true);
    });
  });
});
