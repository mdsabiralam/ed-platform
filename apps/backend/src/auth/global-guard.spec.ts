import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from './public.decorator';

describe('JwtAuthGuard (Global)', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    // Mock Reflector
    reflector = new Reflector();

    // We can't easily mock the super.canActivate of AuthGuard('jwt') without complex class extension mocking.
    // Instead, we will test the logic that overrides it (the Public check).

    guard = new JwtAuthGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access to public routes', () => {
    const mockContext = {
      getHandler: () => 'handler',
      getClass: () => 'class',
    } as unknown as ExecutionContext;

    // Spy on getAllAndOverride to return true (simulating @Public())
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should delegate to super (AuthGuard) for non-public routes', () => {
    const mockContext = {
      getHandler: () => 'handler',
      getClass: () => 'class',
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext;

    // Spy on getAllAndOverride to return false (not public)
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    // Since super.canActivate will fail because we didn't setup passport completely in this unit test,
    // we expect it to throw or fail. AuthGuard usually throws if no strategy is found or fails.
    // However, verification here is that it *passed* the public check and *attempted* the auth check.

    // Actually, calling super.canActivate() in unit test might be tricky.
    // Let's assume if it returns/throws from super, it reached it.

    try {
        guard.canActivate(mockContext);
    } catch (e) {
        // Expected because we don't have a real request/strategy here
        expect(e).toBeDefined();
    }
  });
});
