import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    otpLog: {
      create: jest.fn(),
    },
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
});
