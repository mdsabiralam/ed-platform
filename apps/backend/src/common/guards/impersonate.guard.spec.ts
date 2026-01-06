import { Test, TestingModule } from '@nestjs/testing';
import { ImpersonateGuard } from './impersonate.guard';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

describe('ImpersonateGuard', () => {
  let guard: ImpersonateGuard;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImpersonateGuard,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<ImpersonateGuard>(ImpersonateGuard);
    configService = module.get<ConfigService>(ConfigService);
  });

  const mockContext = (user: any) => ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as any);

  it('should return false if user is not SUPER_ADMIN', () => {
    const context = mockContext({ role: 'TEACHER' });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return false if user is missing', () => {
    const context = mockContext(undefined);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should throw ForbiddenException if IMPERSONATION_ENABLED is false', () => {
    const context = mockContext({ role: UserRole.SUPER_ADMIN });
    jest.spyOn(configService, 'get').mockReturnValue('false');
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should return true if user is SUPER_ADMIN and IMPERSONATION_ENABLED is true', () => {
    const context = mockContext({ role: UserRole.SUPER_ADMIN });
    jest.spyOn(configService, 'get').mockReturnValue('true');
    expect(guard.canActivate(context)).toBe(true);
  });
});
