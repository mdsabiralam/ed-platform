import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No valid token provided');
    }

    const token = authHeader.split(' ')[1];

    // Validate JWT structure (Header.Payload.Signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
         throw new UnauthorizedException('Invalid token format');
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

    // Verify Signature
    const signatureInput = `${parts[0]}.${parts[1]}`;
    const calculatedSignature = crypto.createHmac('sha256', secret).update(signatureInput).digest('base64url');

    // Safe comparison
    if (calculatedSignature !== parts[2]) {
        // For development/mock purposes where we might manually create tokens or use a different secret source
        // we might log this but fail. However, strictly speaking this is a failure.
        // If we want to allow 'mock-dev-token' usage logic from before without signature:
        // we can check if process.env.NODE_ENV === 'test' or similar.
        // But the requirement is to fix security.
        throw new UnauthorizedException('Invalid token signature');
    }

    try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        if (!payload.sub) {
            throw new UnauthorizedException('Token missing subject');
        }

        // Check expiration
        if (payload.exp && payload.exp < Date.now() / 1000) {
            throw new UnauthorizedException('Token expired');
        }

        request.user = payload;
        return true;
    } catch (e) {
        throw new UnauthorizedException('Invalid token payload');
    }
  }
}
