import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            profile: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('switchProfile', () => {
    it('should throw NotFoundException if profile does not exist', async () => {
      jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue(null);

      await expect(service.switchProfile('user-1', 'profile-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if profile userId does not match', async () => {
      jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue({
        id: 'profile-1',
        userId: 'user-2', // Different user
      } as any);

      await expect(service.switchProfile('user-1', 'profile-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return tokens if profile matches', async () => {
      jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1', // Same user
        instituteId: 'inst-1',
        role: 'TEACHER',
      } as any);

      const result = await service.switchProfile('user-1', 'profile-1');
      expect(result).toEqual({
        accessToken: 'mock-token',
        refreshToken: 'mock-token',
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'user-1', instituteId: 'inst-1', role: 'TEACHER' },
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'user-1', instituteId: 'inst-1', role: 'TEACHER' },
        { expiresIn: '7d' },
      );
    });
  });
});
