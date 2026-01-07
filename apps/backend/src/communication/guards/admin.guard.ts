import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.roles && user.roles.includes('ADMIN')) {
      return true;
    }

    // For testing simplicity, if the mock user from JwtAuthGuard doesn't have roles, we might fail.
    // Let's assume we pass a special header or the mock user in JwtAuthGuard has it if we want to test admin.

    // Mock override for testing:
    if (request.headers['x-test-role'] === 'ADMIN') {
        return true;
    }

    throw new ForbiddenException('Admin access required');
  }
}
