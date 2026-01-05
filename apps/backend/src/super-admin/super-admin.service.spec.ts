import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminService } from './super-admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { NotFoundException } from '@nestjs/common';

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
    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.impersonateUser('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should generate tokens for valid user', async () => {
      const mockUser = {
        id: 'user-id',
        profiles: [
          {
            tenantId: 'tenant-1',
            role: 'TEACHER',
          },
        ],
      };

      const mockTokens = { accessToken: 'access', refreshToken: 'refresh' };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(authService, 'generateTokens').mockReturnValue(mockTokens);

      const result = await service.impersonateUser('user-id');

      expect(result).toEqual(mockTokens);
      expect(authService.generateTokens).toHaveBeenCalledWith({
        sub: 'user-id',
        instituteId: 'tenant-1',
        role: 'TEACHER',
      });
    });

    it('should handle user with no profiles', async () => {
        const mockUser = {
          id: 'user-id',
          profiles: [],
        };

        const mockTokens = { accessToken: 'access', refreshToken: 'refresh' };

        jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
        jest.spyOn(authService, 'generateTokens').mockReturnValue(mockTokens);

        const result = await service.impersonateUser('user-id');

        expect(result).toEqual(mockTokens);
        expect(authService.generateTokens).toHaveBeenCalledWith({
          sub: 'user-id',
          instituteId: null,
          role: null,
        });
      });
  });
});
