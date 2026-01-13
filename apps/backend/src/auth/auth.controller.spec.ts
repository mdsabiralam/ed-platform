import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserRole } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return user without passwordHash', async () => {
      const dto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'StrongP@ss1',
        instituteId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const mockResult = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
          passwordHash: 'hashed-secret',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          phone: null,
        },
        profile: {
          id: 'profile-id',
          userId: 'user-id',
          instituteId: dto.instituteId,
          role: UserRole.STUDENT,
        },
      };

      mockAuthService.register.mockResolvedValue(mockResult);

      const result = await controller.register(dto);

      expect(service.register).toHaveBeenCalledWith(dto);
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user).toHaveProperty('email', 'test@example.com');
      expect(result.profile).toEqual(mockResult.profile);
    });
  });
});
