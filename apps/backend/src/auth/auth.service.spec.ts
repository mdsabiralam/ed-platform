import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  const mockTx = {
    user: {
      create: jest.fn(),
    },
    profile: {
      create: jest.fn(),
    },
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return callback(mockTx);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto: RegisterUserDto = {
      email: 'test@example.com',
      password: 'StrongP@ss1',
      instituteId: '123e4567-e89b-12d3-a456-426614174000',
    };

    it('should successfully register a user with default avatar', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const mockUser = { id: 'user-id', email: dto.email, isActive: true };
      const mockProfile = {
        id: 'profile-id',
        userId: 'user-id',
        role: UserRole.ADMIN,
        avatarUrl: expect.stringMatching(/^https:\/\/ui-avatars\.com\/api\/\?name=/)
      };

      mockTx.user.create.mockResolvedValue(mockUser);
      mockTx.profile.create.mockResolvedValue(mockProfile);

      const result = await service.register(dto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockTx.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          passwordHash: 'hashed_password',
          isActive: true,
        },
      });
      expect(mockTx.profile.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          instituteId: dto.instituteId,
          role: UserRole.ADMIN,
          avatarUrl: expect.stringContaining('https://ui-avatars.com/api/?name=')
        },
      });
      expect(result).toEqual({ user: mockUser, profile: mockProfile });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-id', email: dto.email, isActive: true });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if email exists and account is banned (isActive: false)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-id',
        email: dto.email,
        isActive: false
      });

      await expect(service.register(dto)).rejects.toThrow(ForbiddenException);
      await expect(service.register(dto)).rejects.toThrow('Account Banned');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should fail if profile creation fails (transaction rollback simulation)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const mockUser = { id: 'user-id', email: dto.email, isActive: true };
      mockTx.user.create.mockResolvedValue(mockUser);

      const error = new Error('Database Error');
      mockTx.profile.create.mockRejectedValue(error);

      await expect(service.register(dto)).rejects.toThrow(error);

      expect(mockTx.user.create).toHaveBeenCalled();
      expect(mockTx.profile.create).toHaveBeenCalled();
    });
  });
});
