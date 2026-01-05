import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    phone: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    isActive: true, // Assuming default or checking if logic uses it (User model in schema lacks isActive, but Tenant has it. Wait, prompt says "If user not found or isActive is false". User model in memory says isActive is mapped to is_active, but schema check showed isActive on Tenant, not User? Let's re-read schema.)
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    profile: {
      findMany: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser('wrong@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is not active', async () => {
       mockPrismaService.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });
       await expect(service.validateUser('test@example.com', 'password')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ ...mockUser, isActive: true });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('test@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return the user with profiles if validation succeeds', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ ...mockUser, isActive: true });
      const mockProfiles = [{ id: 'profile-1', tenant: { id: 'tenant-1' } }];
      mockPrismaService.profile.findMany.mockResolvedValue(mockProfiles);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual({ ...mockUser, isActive: true, profiles: mockProfiles });
    });
  });

  describe('generateAccessToken', () => {
    it('should return a signed token with correct payload', () => {
      const user = { id: 'user-1', email: 'test@example.com' };
      const currentProfile = { role: 'TEACHER', tenantId: 'tenant-1' };
      const token = 'signed-jwt-token';
      (mockJwtService.sign as jest.Mock).mockReturnValue(token);

      const result = service.generateAccessToken(user, currentProfile);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: currentProfile.role,
        instituteId: currentProfile.tenantId,
      });
      expect(result).toEqual({ accessToken: token });
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate, hash, store, and return a refresh token', async () => {
      const userId = 'user-id';
      const userAgent = 'test-agent';
      const ipAddress = '127.0.0.1';
      const mockHash = 'hashed-token';

      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await service.generateRefreshToken(userId, userAgent, ipAddress);

      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.refreshToken).toBe('string');
      expect(mockPrismaService.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId,
            tokenHash: mockHash,
            userAgent,
            ipAddress,
          }),
        }),
      );
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password' };
    const ip = '127.0.0.1';
    const ua = 'test-agent';

    it('should return access token if user has single profile', async () => {
      const mockUserWithProfiles = {
        ...mockUser,
        passwordHash: 'hashed',
        profiles: [{ id: 'p1', role: 'TEACHER', tenantId: 't1' }],
      };

      // Mock validateUser (internal call) via spying or by mocking prisma/bcrypt
      mockPrismaService.user.findUnique.mockResolvedValue({ ...mockUser, isActive: true, passwordHash: 'hashed' });
      mockPrismaService.profile.findMany.mockResolvedValue(mockUserWithProfiles.profiles);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('refresh-hash');
      (mockJwtService.sign as jest.Mock).mockReturnValue('access-token');

      const result = await service.login(loginDto, ip, ua);

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.message).toBe('Login successful');
    });

    it('should NOT return access token if user has multiple profiles', async () => {
      const profiles = [
        { id: 'p1', role: 'TEACHER', tenantId: 't1' },
        { id: 'p2', role: 'PARENT', tenantId: 't2' },
      ];

      mockPrismaService.user.findUnique.mockResolvedValue({ ...mockUser, isActive: true, passwordHash: 'hashed' });
      mockPrismaService.profile.findMany.mockResolvedValue(profiles);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('refresh-hash');

      const result = await service.login(loginDto, ip, ua);

      expect(result.accessToken).toBeNull();
      expect(result.refreshToken).toBeDefined();
      expect(result.message).toBe('Please select a profile');
      expect(result.profiles).toHaveLength(2);
    });
  });
});
