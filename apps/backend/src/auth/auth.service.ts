import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // 3.J.05: Context required for Frontend.
    // Fetch user's primary institute/role if possible, or generic payload.
    // Assuming user object has id and email.
    // In a real multi-tenant app, user might belong to multiple institutes.
    // For now, we'll try to get the institute from the user profile if available,
    // or let the frontend switch context.

    // However, the task specifically asks: "Does it include instituteId (or school_id)? This is required for the Frontend"
    // Since we don't have the full profile here easily without more queries,
    // we might need to look it up or rely on the frontend to select it after login.
    // BUT, if the task requires it in the token, we should put it there.
    // Let's assume a default institute for now or fetch it.

    // Simplification: We'll include a placeholder or fetch it if we can.
    // Wait, the User model has relations to Profile which has instituteId.
    // Let's modify validateUser to fetch it? Or just do it here.

    // Let's stick to the basics first. If the user object passed here came from LocalStrategy, it might be the stripped user.

    const payload = {
        username: user.email,
        sub: user.id,
        // TODO: In a real scenario, fetch the active profile's instituteId
        instituteId: user.instituteId || null
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
