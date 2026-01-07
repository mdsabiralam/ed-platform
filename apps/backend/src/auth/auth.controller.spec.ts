import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    otpLog: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(() => 'mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('forgotPassword', () => {
    it('should return fake success if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await controller.forgotPassword({ email: 'nonexistent@example.com' });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
      expect(mockPrismaService.otpLog.create).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'If your email is registered, you will receive a reset code shortly.' });
    });

    it('should generate code and return success if user exists', async () => {
      const mockUser = { id: 'user-id', email: 'existing@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.otpLog.create.mockResolvedValue({});

      const result = await controller.forgotPassword({ email: 'existing@example.com' });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: 'existing@example.com' } });
      expect(mockPrismaService.otpLog.create).toHaveBeenCalled();
      expect(result).toEqual({ message: 'If your email is registered, you will receive a reset code shortly.' });
    });
  });

  describe('verifyOtp', () => {
    it('should return reset token if OTP is valid', async () => {
      const mockOtp = {
        id: 'otp-id',
        email: 'test@example.com',
        otpCode: '123456',
        expiresAt: new Date(Date.now() + 10000), // Future date
        isUsed: false,
      };
      mockPrismaService.otpLog.findFirst.mockResolvedValue(mockOtp);
      mockPrismaService.otpLog.update.mockResolvedValue(mockOtp);

      const result = await controller.verifyOtp({ email: 'test@example.com', otp: '123456' });

      expect(mockPrismaService.otpLog.update).toHaveBeenCalledWith({
        where: { id: 'otp-id' },
        data: { isUsed: true },
      });
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result).toEqual({ resetToken: 'mock-jwt-token' });
    });

    it('should throw BadRequestException if OTP is invalid or not found', async () => {
      mockPrismaService.otpLog.findFirst.mockResolvedValue(null);

      await expect(controller.verifyOtp({ email: 'test@example.com', otp: 'wrong' }))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if OTP is expired', async () => {
      const mockOtp = {
        id: 'otp-id',
        email: 'test@example.com',
        otpCode: '123456',
        expiresAt: new Date(Date.now() - 10000), // Past date
        isUsed: false,
      };
      mockPrismaService.otpLog.findFirst.mockResolvedValue(mockOtp);

      await expect(controller.verifyOtp({ email: 'test@example.com', otp: '123456' }))
        .rejects.toThrow(BadRequestException);
    });
  });
});
