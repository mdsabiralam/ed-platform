import { Test, TestingModule } from '@nestjs/testing';
import { AdmissionService } from './admission.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AdmissionService', () => {
  let service: AdmissionService;
  let prisma: PrismaService;

  const mockPrismaService = {
    admissionSession: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    class: {
      findUnique: jest.fn(),
    },
    student: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdmissionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdmissionService>(AdmissionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkSessionValidity', () => {
    it('should throw "Session Expired" error if current date is past end date', async () => {
      const expiredSessionId = 'expired-session-id';
      const expiredSession = {
        id: expiredSessionId,
        name: '2020-2021',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2020-12-31'), // Expired
        isActive: false,
      };

      mockPrismaService.admissionSession.findUnique.mockResolvedValue(expiredSession);

      await expect(service.checkSessionValidity(expiredSessionId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.checkSessionValidity(expiredSessionId)).rejects.toThrow(
        'Session Expired',
      );
    });

    it('should return true if session is valid', async () => {
      const validSessionId = 'valid-session-id';
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const validSession = {
        id: validSessionId,
        name: 'Future-Session',
        startDate: new Date(),
        endDate: futureDate,
        isActive: true,
      };

      mockPrismaService.admissionSession.findUnique.mockResolvedValue(validSession);

      const result = await service.checkSessionValidity(validSessionId);
      expect(result).toBe(true);
    });
  });

  describe('checkClassCapacity', () => {
    it('should throw "Class seat capacity reached" if full', async () => {
      const classId = 'class-id';
      const tenantId = 'tenant-id';
      const sessionId = 'session-id';

      mockPrismaService.class.findUnique.mockResolvedValue({
        id: classId,
        seatCapacity: 10,
      });
      mockPrismaService.student.count.mockResolvedValue(10); // Full

      await expect(service.checkClassCapacity(tenantId, classId, sessionId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return true if capacity is available', async () => {
      const classId = 'class-id';
      const tenantId = 'tenant-id';
      const sessionId = 'session-id';

      mockPrismaService.class.findUnique.mockResolvedValue({
        id: classId,
        seatCapacity: 10,
      });
      mockPrismaService.student.count.mockResolvedValue(9); // Not full

      const result = await service.checkClassCapacity(tenantId, classId, sessionId);
      expect(result).toBe(true);
    });
  });
});
