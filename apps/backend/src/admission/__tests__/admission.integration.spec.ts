import { Test, TestingModule } from '@nestjs/testing';
import { AdmissionService } from '../admission.service';
import { AdmissionController } from '../admission.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { FinanceService } from '../../finance/finance.service';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { MatriculateDto } from '../dto/matriculate.dto';

// Mock dependencies
const mockPrismaService = {
  $transaction: jest.fn((callback) => callback(mockPrismaService)),
  studentApplication: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  admissionSequence: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findUniqueOrThrow: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  profile: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  guardian: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findUniqueOrThrow: jest.fn(),
  },
  student: {
    aggregate: jest.fn(),
    create: jest.fn(),
  },
  parentStudentMapping: {
    create: jest.fn(),
  },
  studentFeeLedger: {
    create: jest.fn(),
  },
};

const mockFinanceService = {
  initializeFeeLedger: jest.fn(),
};

describe('AdmissionIntegration (Mocked)', () => {
  let service: AdmissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdmissionController],
      providers: [
        AdmissionService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: FinanceService, useValue: mockFinanceService },
      ],
    }).compile();

    service = module.get<AdmissionService>(AdmissionService);
    jest.clearAllMocks();
  });

  it('should matriculate a student successfully (Happy Path)', async () => {
    const dto: MatriculateDto = {
      applicationId: 'app-123',
      targetClassId: 'class-1',
      targetSectionId: 'section-A',
    };

    // Setup Mocks
    mockPrismaService.studentApplication.findUnique.mockResolvedValue({
      id: 'app-123',
      tenantId: 'tenant-1',
      admissionSessionId: 'session-1',
      firstName: 'John',
      lastName: 'Doe',
      parentEmail: 'parent@example.com',
      parentPhone: '1234567890',
      status: 'PENDING',
    });

    mockPrismaService.admissionSequence.findUnique.mockResolvedValue({ id: 'seq-1', lastSeq: 100 });
    mockPrismaService.admissionSequence.update.mockResolvedValue({ lastSeq: 101 }); // New ADM will be ADM000101

    mockPrismaService.user.findFirst.mockResolvedValue(null); // Parent not exists
    mockPrismaService.user.create.mockResolvedValue({ id: 'user-parent' });
    mockPrismaService.guardian.create.mockResolvedValue({ id: 'guardian-1', userId: 'user-parent' });
    mockPrismaService.guardian.findUnique.mockResolvedValue({ id: 'guardian-1', userId: 'user-parent' });
    mockPrismaService.guardian.findUniqueOrThrow.mockResolvedValue({ id: 'guardian-1', userId: 'user-parent' });

    mockPrismaService.student.aggregate.mockResolvedValue({ _max: { rollNo: 5 } }); // Next roll 6
    mockPrismaService.student.create.mockResolvedValue({ id: 'student-1' });

    const result = await service.matriculate(dto);

    expect(mockPrismaService.studentApplication.update).toHaveBeenCalledWith({
      where: { id: 'app-123' },
      data: expect.objectContaining({ status: 'MATRICULATED', studentId: 'student-1' }),
    });
    expect(mockPrismaService.studentFeeLedger.create).toHaveBeenCalled();
  });

  it('should verify atomicity: rollback if Fee Ledger fails', async () => {
    const dto: MatriculateDto = {
        applicationId: 'app-123',
        targetClassId: 'class-1',
        targetSectionId: 'section-A',
    };

    // Fail at fee ledger step
    mockFinanceService.initializeFeeLedger.mockRejectedValue(new Error('Finance Error'));

    // Mock initial steps passing
    mockPrismaService.studentApplication.findUnique.mockResolvedValue({
        id: 'app-123',
        tenantId: 'tenant-1',
        status: 'PENDING',
    });
    mockPrismaService.admissionSequence.findUnique.mockResolvedValue({ id: 'seq-1', lastSeq: 100 });
    mockPrismaService.admissionSequence.update.mockResolvedValue({ lastSeq: 101 });
    mockPrismaService.user.findFirst.mockResolvedValue(null);
    mockPrismaService.user.create.mockResolvedValue({ id: 'user-parent' });
    mockPrismaService.guardian.create.mockResolvedValue({ id: 'guardian-1', userId: 'user-parent' });
    mockPrismaService.guardian.findUnique.mockResolvedValue({ id: 'guardian-1' });
    mockPrismaService.guardian.findUniqueOrThrow.mockResolvedValue({ id: 'guardian-1' });
    mockPrismaService.student.aggregate.mockResolvedValue({ _max: { rollNo: 5 } });
    mockPrismaService.student.create.mockResolvedValue({ id: 'student-1' });

    // Since we mock $transaction to just execute callback, the thrown error will propagate.
    // In a real DB, this would cause rollback.
    // We check that the function throws.
    await expect(service.matriculate(dto)).rejects.toThrow(InternalServerErrorException);
  });
});
