import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret', // Fallback for dev/test
    });
  }

  async validate(payload: any) {
    // This method is called after the token is verified.
    // The return value is injected into req.user
    if (!payload || !payload.sub) {
       throw new UnauthorizedException();
    }
    return { id: payload.sub, email: payload.email, tenantId: payload.tenantId, role: payload.role };
  }
}
