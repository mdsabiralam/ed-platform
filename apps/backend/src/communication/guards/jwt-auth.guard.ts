import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // In a real application, this would validate the JWT token.
    // For this simulation, we assume if an Authorization header is present or user is injected, it passes.
    // Or we can rely on a previous middleware.

    // Simplistic check for demo:
    if (request.headers.authorization || request.user) {
        // If user is not yet attached, attach a dummy one for testing if header is present
        if (!request.user && request.headers.authorization) {
            request.user = { id: 'user-123', roles: ['USER'] }; // Mock user
        }
        return true;
    }

    throw new UnauthorizedException('Missing Authorization Header');
  }
}
