import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Mock implementation for scaffolding
    const request = context.switchToHttp().getRequest();
    // Assuming a valid user is always present in a mock setup or we allow it
    // In real implementation this verifies JWT
    return true;
  }
}
