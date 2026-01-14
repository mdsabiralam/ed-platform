import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedpassword',
    phone: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when passwords match', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser('test@example.com', 'password');

      expect(userService.findOne).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        mockUser.passwordHash,
      );
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        phone: mockUser.phone,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        deletedAt: mockUser.deletedAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return null when passwords do not match', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(userService.findOne).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        mockUser.passwordHash,
      );
      expect(result).toBeNull();
    });

    it('should return null when user is not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      const result = await service.validateUser(
        'unknown@example.com',
        'password',
      );

      expect(userService.findOne).toHaveBeenCalledWith('unknown@example.com');
      expect(result).toBeNull();
    });
  });
});
