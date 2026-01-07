import { Test, TestingModule } from '@nestjs/testing';
import { AdmissionsService } from './admissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdmissionStatus, UserRole } from '@prisma/client';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('AdmissionsService State Machine', () => {
  let service: AdmissionsService;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;

  const mockPrisma = {
    admissionApplication: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    admissionAuditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdmissionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<AdmissionsService>(AdmissionsService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStatus', () => {
    it('should transition from DRAFT to SUBMITTED if validation passes', async () => {
      const app = {
          id: '1',
          status: AdmissionStatus.DRAFT,
          firstName: 'John',
          lastName: 'Doe',
          phone: '123'
      };
      mockPrisma.admissionApplication.findUnique.mockResolvedValue(app);
      mockPrisma.admissionApplication.update.mockResolvedValue({ ...app, status: AdmissionStatus.SUBMITTED });

      const result = await service.updateStatus('1', AdmissionStatus.SUBMITTED, 'user1', UserRole.PARENT);

      expect(result.status).toBe(AdmissionStatus.SUBMITTED);
      expect(mockPrisma.admissionAuditLog.create).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('admission.status.changed', expect.any(Object));
    });

    it('should fail DRAFT to SUBMITTED if mandatory fields missing', async () => {
      const app = {
          id: '1',
          status: AdmissionStatus.DRAFT,
          firstName: 'John'
          // Missing lastName, phone
      };
      mockPrisma.admissionApplication.findUnique.mockResolvedValue(app);

      await expect(
        service.updateStatus('1', AdmissionStatus.SUBMITTED, 'user1', UserRole.PARENT)
      ).rejects.toThrow(BadRequestException);
    });

    it('should require remarks when status is REJECTED', async () => {
       const app = {
          id: '1',
          status: AdmissionStatus.SUBMITTED,
          firstName: 'John',
          lastName: 'Doe',
          phone: '123'
      };
      mockPrisma.admissionApplication.findUnique.mockResolvedValue(app);

      await expect(
        service.updateStatus('1', AdmissionStatus.REJECTED, 'admin1', UserRole.ADMIN, '') // Empty remarks
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow REJECTED with remarks', async () => {
       const app = {
          id: '1',
          status: AdmissionStatus.SUBMITTED,
          firstName: 'John',
          lastName: 'Doe',
          phone: '123'
      };
      mockPrisma.admissionApplication.findUnique.mockResolvedValue(app);
      mockPrisma.admissionApplication.update.mockResolvedValue({ ...app, status: AdmissionStatus.REJECTED });

      await service.updateStatus('1', AdmissionStatus.REJECTED, 'admin1', UserRole.ADMIN, 'Not qualified');
      expect(mockPrisma.admissionApplication.update).toHaveBeenCalled();
    });

    it('should prevent non-admin from moving SUBMITTED to UNDER_REVIEW', async () => {
       const app = {
          id: '1',
          status: AdmissionStatus.SUBMITTED
      };
      mockPrisma.admissionApplication.findUnique.mockResolvedValue(app);

      await expect(
        service.updateStatus('1', AdmissionStatus.UNDER_REVIEW, 'parent1', UserRole.PARENT)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to move SUBMITTED to UNDER_REVIEW', async () => {
       const app = {
          id: '1',
          status: AdmissionStatus.SUBMITTED
      };
      mockPrisma.admissionApplication.findUnique.mockResolvedValue(app);
      mockPrisma.admissionApplication.update.mockResolvedValue({ ...app, status: AdmissionStatus.UNDER_REVIEW });

      await service.updateStatus('1', AdmissionStatus.UNDER_REVIEW, 'admin1', UserRole.ADMIN);
      expect(mockPrisma.admissionApplication.update).toHaveBeenCalled();
    });

    it('should prevent modifying REJECTED application if not SUPER_ADMIN', async () => {
       const app = {
          id: '1',
          status: AdmissionStatus.REJECTED
      };
      mockPrisma.admissionApplication.findUnique.mockResolvedValue(app);

      await expect(
        service.updateStatus('1', AdmissionStatus.UNDER_REVIEW, 'admin1', UserRole.ADMIN)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow SUPER_ADMIN to modify REJECTED application', async () => {
       const app = {
          id: '1',
          status: AdmissionStatus.REJECTED
      };
      mockPrisma.admissionApplication.findUnique.mockResolvedValue(app);
      mockPrisma.admissionApplication.update.mockResolvedValue({ ...app, status: AdmissionStatus.UNDER_REVIEW });

      await service.updateStatus('1', AdmissionStatus.UNDER_REVIEW, 'super1', UserRole.SUPER_ADMIN);
      expect(mockPrisma.admissionApplication.update).toHaveBeenCalled();
    });
  });

  describe('canApproveApplication', () => {
      it('should return true for SUPER_ADMIN regardless of status', () => {
          expect(service.canApproveApplication(UserRole.SUPER_ADMIN, AdmissionStatus.REJECTED)).toBe(true);
      });

      it('should return false for ADMIN if status is REJECTED', () => {
          expect(service.canApproveApplication(UserRole.ADMIN, AdmissionStatus.REJECTED)).toBe(false);
      });

       it('should return true for ADMIN if status is SUBMITTED', () => {
          expect(service.canApproveApplication(UserRole.ADMIN, AdmissionStatus.SUBMITTED)).toBe(true);
      });
  });

  describe('bulkUpdateStatus', () => {
      it('should enforce mandatory fields when bulk updating DRAFT to SUBMITTED', async () => {
          const app = {
              id: '1',
              status: AdmissionStatus.DRAFT,
              firstName: 'John'
              // Missing lastName, phone
          };
          mockPrisma.admissionApplication.findUnique.mockResolvedValue(app);

          await expect(
            service.bulkUpdateStatus(['1'], AdmissionStatus.SUBMITTED, 'admin1', UserRole.ADMIN)
          ).rejects.toThrow(BadRequestException);
      });

      it('should fail bulk rejection if remarks are missing', async () => {
           await expect(
            service.bulkUpdateStatus(['1'], AdmissionStatus.REJECTED, 'admin1', UserRole.ADMIN)
          ).rejects.toThrow(BadRequestException);
      });

      it('should pass bulk rejection if remarks are provided', async () => {
          const app = {
              id: '1',
              status: AdmissionStatus.SUBMITTED,
              firstName: 'John',
              lastName: 'Doe',
              phone: '123'
          };
          mockPrisma.admissionApplication.findUnique.mockResolvedValue(app);
          mockPrisma.admissionApplication.update.mockResolvedValue({ ...app, status: AdmissionStatus.REJECTED });

           await service.bulkUpdateStatus(['1'], AdmissionStatus.REJECTED, 'admin1', UserRole.ADMIN, 'Bulk Reject');
           expect(mockPrisma.admissionApplication.update).toHaveBeenCalled();
           expect(mockPrisma.admissionAuditLog.create).toHaveBeenCalled();
      });
  });
});
