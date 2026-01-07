import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminService } from './super-admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('SuperAdminService', () => {
  let service: SuperAdminService;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperAdminService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            platformAdmin: {
                findUnique: jest.fn(),
            },
            platformAuditLog: {
                create: jest.fn(),
            },
          },
        },
        {
          provide: AuthService,
          useValue: {
            generateTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SuperAdminService>(SuperAdminService);
    prisma = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('impersonateUser', () => {
    it('should throw UnauthorizedException if admin record not found', async () => {
        jest.spyOn(prisma.platformAdmin, 'findUnique').mockResolvedValue(null);

        await expect(service.impersonateUser('admin-user-id', 'target-id', '1.1.1.1')).rejects.toThrow(
          UnauthorizedException,
        );
    });

    it('should throw NotFoundException if target user does not exist', async () => {
      jest.spyOn(prisma.platformAdmin, 'findUnique').mockResolvedValue({ id: 'admin-id' } as any);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.impersonateUser('admin-user-id', 'invalid-id', '1.1.1.1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should generate tokens and log audit for valid user', async () => {
      const mockAdmin = { id: 'admin-id' };
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        profiles: [
          {
            tenantId: 'tenant-1',
            role: 'TEACHER',
          },
        ],
      };

      const mockTokens = { accessToken: 'access', refreshToken: 'refresh' };

      jest.spyOn(prisma.platformAdmin, 'findUnique').mockResolvedValue(mockAdmin as any);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(authService, 'generateTokens').mockReturnValue(mockTokens);

      const result = await service.impersonateUser('admin-user-id', 'user-id', '1.1.1.1');

      expect(result).toEqual(mockTokens);
      expect(prisma.platformAuditLog.create).toHaveBeenCalledWith({
          data: {
              adminId: 'admin-id',
              action: 'IMPERSONATE_USER',
              target: 'user-id',
              ipAddress: '1.1.1.1',
              details: { targetEmail: 'user@example.com' },
          }
      });
      expect(authService.generateTokens).toHaveBeenCalledWith({
        sub: 'user-id',
        instituteId: 'tenant-1',
        role: 'TEACHER',
      });
    });
  });
});
