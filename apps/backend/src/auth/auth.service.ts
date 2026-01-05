import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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

    // Logic to switch profile (e.g., generate new token)
    // For now returning success message as per current scope
    return {
      message: 'Profile switched successfully',
      profileId: targetProfileId,
      userId
    };
  }
}
