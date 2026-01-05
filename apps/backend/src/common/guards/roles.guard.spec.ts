import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../../auth/enums/role.enum';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  const createMockContext = (user?: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    } as any;
  };

  it('should allow access if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockContext({ role: Role.STUDENT });
    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.TEACHER]);
    const context = createMockContext({ role: Role.TEACHER });
    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should deny access if User has Role STUDENT and Route requires INSTITUTE_ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.INSTITUTE_ADMIN]);
    const context = createMockContext({ role: Role.STUDENT });
    expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access if User has Role INSTITUTE_ADMIN and Route requires TEACHER (Hierarchy)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.TEACHER]);
    const context = createMockContext({ role: Role.INSTITUTE_ADMIN });
    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should allow access if user is SUPER_ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.TEACHER]);
    const context = createMockContext({ role: Role.SUPER_ADMIN });
    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user is missing', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.TEACHER]);
    const context = createMockContext(undefined);
    expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
  });
});
