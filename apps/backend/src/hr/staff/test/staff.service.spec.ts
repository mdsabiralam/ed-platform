import { Test, TestingModule } from '@nestjs/testing';
import { StaffService } from '../staff.service';
import { PrismaService } from '../../../prisma/prisma.service';

const mockPrismaService = {
  $transaction: jest.fn((callback) => callback(mockPrismaService)),
  user: {
    create: jest.fn(),
  },
  staffProfile: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  profile: {
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('StaffService', () => {
  let service: StaffService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onboardStaff', () => {
    it('should create user, staff profile and assign role transactionally', async () => {
      const dto = {
        email: 'test@test.com',
        phone: '1234567890',
        password: 'password',
        designation: 'Teacher',
        departmentId: 'dept1',
        dateOfJoining: '2023-01-01',
        panNumber: 'ABCDE1234F',
        qualification: 'M.Sc',
        bloodGroup: 'O+',
        isTeachingStaff: true,
        tenantId: 'tenant1',
      };

      mockPrismaService.user.create.mockResolvedValue({ id: 'user1', email: dto.email });
      mockPrismaService.staffProfile.create.mockResolvedValue({ id: 'staff1', userId: 'user1' });

      await service.onboardStaff(dto);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ email: dto.email })
      }));
      expect(mockPrismaService.staffProfile.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ userId: 'user1', departmentId: dto.departmentId })
      }));
      expect(mockPrismaService.profile.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ userId: 'user1', role: 'TEACHER' })
      }));
    });
  });

  describe('getStaffDirectory', () => {
      it('should return staff with department and no PII', async () => {
          mockPrismaService.staffProfile.findMany.mockResolvedValue([]);
          await service.getStaffDirectory('Science', true);
          expect(mockPrismaService.staffProfile.findMany).toHaveBeenCalledWith({
              where: {
                  department: { name: 'Science' },
                  isTeachingStaff: true
              },
              select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  designation: true,
                  department: {
                      select: { id: true, name: true }
                  },
                  user: {
                      select: { email: true, phone: true }
                  },
                  isTeachingStaff: true
              }
          });
      });
  });

  describe('getKycUploadPath', () => {
      it('should return correct path', () => {
          expect(service.getKycUploadPath('staff123')).toBe('staff/staff123/kyc/');
      });
  });
});
