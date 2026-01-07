import { Test, TestingModule } from '@nestjs/testing';
import { HrService } from './hr.service';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceBookEventType } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('HrService', () => {
  let service: HrService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrService,
        {
          provide: PrismaService,
          useValue: {
            serviceBook: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
            leaveBalance: {
              create: jest.fn(),
            },
            staffProfile: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HrService>(HrService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createServiceBookEntry', () => {
    it('should create a service book entry', async () => {
      const data = {
        staffId: 'staff-1',
        eventDate: new Date(Date.now() - 1000), // Past date
        eventType: ServiceBookEventType.Appointment,
        authorizedBy: 'admin-1',
      };

      (prisma.staffProfile.findUnique as jest.Mock).mockResolvedValue({ id: 'staff-1' });
      (prisma.serviceBook.create as jest.Mock).mockResolvedValue(data);

      await expect(service.createServiceBookEntry(data)).resolves.toEqual(data);
    });

    it('should throw BadRequestException if date is in future', async () => {
      const data = {
        staffId: 'staff-1',
        eventDate: new Date(Date.now() + 1000000), // Future date
        eventType: ServiceBookEventType.Appointment,
        authorizedBy: 'admin-1',
      };

      await expect(service.createServiceBookEntry(data)).rejects.toThrow(BadRequestException);
    });

    it('should allow future date for Termination', async () => {
       const data = {
        staffId: 'staff-1',
        eventDate: new Date(Date.now() + 1000000), // Future date
        eventType: ServiceBookEventType.Termination,
        authorizedBy: 'admin-1',
      };

      (prisma.staffProfile.findUnique as jest.Mock).mockResolvedValue({ id: 'staff-1' });
      (prisma.serviceBook.create as jest.Mock).mockResolvedValue(data);

      await expect(service.createServiceBookEntry(data)).resolves.toEqual(data);
    });
  });

  describe('initializeLeaveBalance', () => {
      it('should calculate pro-rata leaves correctly for January joining', async () => {
          // Jan is month 0. Remaining = 12. Quota = 12.
          const joiningDate = new Date('2024-01-01');
          await service.initializeLeaveBalance('staff-1', joiningDate);
          expect(prisma.leaveBalance.create).toHaveBeenCalledWith({
              data: {
                  staffId: 'staff-1',
                  year: 2024,
                  clQuota: 12,
                  slQuota: 12,
                  plQuota: 12
              }
          });
      });

      it('should calculate pro-rata leaves correctly for July joining', async () => {
          // July is month 6. Remaining = 6. Quota = 6.
          const joiningDate = new Date('2024-07-01');
          await service.initializeLeaveBalance('staff-1', joiningDate);
          expect(prisma.leaveBalance.create).toHaveBeenCalledWith({
              data: {
                  staffId: 'staff-1',
                  year: 2024,
                  clQuota: 6,
                  slQuota: 6,
                  plQuota: 6
              }
          });
      });
  });
});
