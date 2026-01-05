import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  generateTokens(payload: any) {
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async switchProfile(userId: string, targetProfileId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: targetProfileId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You do not own this profile');
    }

    const payload = {
      sub: userId,
      instituteId: profile.instituteId,
      role: profile.role,
    };

    return this.generateTokens(payload);
  }
}
