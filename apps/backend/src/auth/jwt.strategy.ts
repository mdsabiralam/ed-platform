import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    // 3.J.05: Ensure JWT includes instituteId.
    // The payload returned here is injected into request.user
    return {
      userId: payload.sub,
      username: payload.username,
      instituteId: payload.instituteId, // school_id
      role: payload.role
    };
  }
}
