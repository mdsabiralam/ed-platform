import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // 1. Check for Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    // 2. Mock Validation (since real AuthModule is missing in this context)
    // In a real app, we would verify the token with JwtService.
    // Here we just check for a non-empty token string.
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    // 3. Attach Mock User to Request (so controllers don't crash)
    request.user = {
      id: 'mock-user-id',
      tenantId: 'mock-tenant-id', // Default mock tenant
      role: 'ADMIN'
    };

    return true;
  }
}
