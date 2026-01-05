import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      // For development/onboarding flow without full auth setup:
      // We allow the request but DO NOT set the user.
      // The RolesGuard will then fail if it requires a user.
      // However, to enable the 'Super Admin' onboarding test, we need a way to mock the Super Admin.
      // We will look for a custom header 'x-mock-role' or just allow a 'Bearer SUPER_ADMIN_TOKEN'
      // This is temporary until full JWT strategy is migrated.
      return true;
    }

    const token = authHeader.split(' ')[1];

    // MOCK IMPLEMENTATION:
    // If token is 'SUPER_SECRET_ADMIN_TOKEN', we grant SUPER_ADMIN
    if (token === 'SUPER_SECRET_ADMIN_TOKEN') {
        request.user = {
            id: 'mock-admin-id',
            role: UserRole.SUPER_ADMIN,
            email: 'admin@edumatrix.com'
        };
        return true;
    }

    // Default mock user for other tokens
    request.user = {
        id: 'mock-user-id',
        role: UserRole.TEACHER, // Default to low privilege
    };

    return true;
  }
}
