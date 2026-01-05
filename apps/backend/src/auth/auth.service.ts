import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

  generateAccessToken(user: any, currentProfile: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: currentProfile.role,
      instituteId: currentProfile.tenantId,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async generateRefreshToken(userId: string, userAgent: string, ipAddress: string) {
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    return { refreshToken };
  }
}
