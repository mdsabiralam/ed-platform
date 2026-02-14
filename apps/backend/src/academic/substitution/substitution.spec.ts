import { Test, TestingModule } from '@nestjs/testing';
import { SubstitutionService } from './substitution.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException } from '@nestjs/common';

describe('SubstitutionService', () => {
  let service: SubstitutionService;
  let prisma: PrismaService;

  const mockPrisma = {
    routineSubstitution: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    routineEntry: {
      findFirst: jest.fn(),
    },
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubstitutionService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<SubstitutionService>(SubstitutionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should throw BadRequestException (Double Booking) if teacher is busy', async () => {
    // 1. Setup Data
    const substitutionId = 'sub-1';
    const teacherB = 'teacher-B';
    const date = new Date('2025-01-01T09:00:00Z');

    // Mock finding the substitution request
    mockPrisma.routineSubstitution.findUnique.mockResolvedValue({
      id: substitutionId,
      date: date,
      routineEntry: { slotId: 'slot-1', dayOfWeek: 'MON' },
    });

    // 2. Mock Conflict Check (Step 4 logic)
    // isTeacherFree -> check routine -> check substitution

    // Assume Teacher B has NO regular routine conflict
    mockPrisma.routineEntry.findFirst.mockResolvedValue(null);

    // BUT Teacher B HAS a substitution conflict (already assigned elsewhere)
    mockPrisma.routineSubstitution.findFirst.mockResolvedValue({
      id: 'existing-sub',
      substituteTeacherId: teacherB,
    });

    // 3. Execute & Assert
    await expect(
      service.assignSubstitute({
        substitutionId,
        substituteTeacherId: teacherB,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
