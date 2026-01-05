import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
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

    it('should return success if profile matches', async () => {
      jest.spyOn(prisma.profile, 'findUnique').mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1', // Same user
      } as any);

      const result = await service.switchProfile('user-1', 'profile-1');
      expect(result).toEqual({
        message: 'Profile switched successfully',
        profileId: 'profile-1',
        userId: 'user-1',
      });
    });
  });
});
