import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Mock implementation allowing all requests
    const request = context.switchToHttp().getRequest();
    // Simulate user if missing (for testing purposes)
    if (!request.user) {
        request.user = { id: request.headers['x-user-id'] || 'mock-user-id' };
    }
    return true;
  }
}
