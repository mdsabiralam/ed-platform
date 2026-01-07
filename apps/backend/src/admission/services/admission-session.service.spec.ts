import { Test, TestingModule } from '@nestjs/testing';
import { AdmissionSessionService } from './admission-session.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AdmissionSessionService', () => {
  let service: AdmissionSessionService;
  let prisma: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    admissionSession: {
      create: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
    },
    class: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdmissionSessionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdmissionSessionService>(AdmissionSessionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a session and deactivate others if is_active is true', async () => {
      const tenantId = 'tenant-1';
      const dto = { name: '2024-2025', start_date: '2024-01-01', end_date: '2024-12-31', is_active: true };

      mockPrismaService.admissionSession.create.mockResolvedValue({ id: 'session-1', ...dto, isActive: true });

      await service.create(tenantId, dto);

      expect(mockPrismaService.admissionSession.updateMany).toHaveBeenCalledWith({
        where: { tenantId, isActive: true },
        data: { isActive: false },
      });
      expect(mockPrismaService.admissionSession.create).toHaveBeenCalled();
    });

    it('should create a session without deactivating others if is_active is false', async () => {
      const tenantId = 'tenant-1';
      const dto = { name: '2024-2025', start_date: '2024-01-01', end_date: '2024-12-31', is_active: false };

      mockPrismaService.admissionSession.create.mockResolvedValue({ id: 'session-1', ...dto, isActive: false });

      await service.create(tenantId, dto);

      expect(mockPrismaService.admissionSession.updateMany).not.toHaveBeenCalled();
      expect(mockPrismaService.admissionSession.create).toHaveBeenCalled();
    });
  });

  describe('checkSeatAvailability', () => {
    it('should return true if seats are available', async () => {
      const classId = 'class-1';
      const classData = { seatCapacity: 40, _count: { applications: 10 } };
      mockPrismaService.class.findUnique.mockResolvedValue(classData);

      const result = await service.checkSeatAvailability(classId);
      expect(result).toBe(true);
    });

    it('should throw BadRequestException if seats are full', async () => {
      const classId = 'class-1';
      const classData = { seatCapacity: 40, _count: { applications: 40 } };
      mockPrismaService.class.findUnique.mockResolvedValue(classData);

      await expect(service.checkSeatAvailability(classId)).rejects.toThrow(BadRequestException);
    });

    it('should return false if class not found', async () => {
      const classId = 'class-1';
      mockPrismaService.class.findUnique.mockResolvedValue(null);

      const result = await service.checkSeatAvailability(classId);
      expect(result).toBe(false);
    });
  });

  describe('findActive', () => {
    it('should return the active session', async () => {
      const tenantId = 'tenant-1';
      const session = { id: 'session-1', isActive: true };
      mockPrismaService.admissionSession.findFirst.mockResolvedValue(session);

      const result = await service.findActive(tenantId);
      expect(result).toEqual(session);
    });

    it('should throw NotFoundException if no active session', async () => {
      const tenantId = 'tenant-1';
      mockPrismaService.admissionSession.findFirst.mockResolvedValue(null);

      await expect(service.findActive(tenantId)).rejects.toThrow(NotFoundException);
    });
  });
});
