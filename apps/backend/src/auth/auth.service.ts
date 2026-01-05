import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const profiles = await this.getUserProfiles(user.id);
    return { ...user, profiles };
  }

  private async getUserProfiles(userId: string) {
    return this.prisma.profile.findMany({
      where: { userId },
      include: { tenant: true },
    });
  }
}
