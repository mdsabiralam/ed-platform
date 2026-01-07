import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResellerService {
  private readonly logger = new Logger(ResellerService.name);

  constructor(private prisma: PrismaService) {}

  // 1. Track Referral (Cookie Logic is usually handled by Controller setting cookie)
  // This service method finds the reseller and logs the linkage if a tenant signs up.
  // For the specific requirement "If a school signs up within 30 days... attribute sale",
  // this would typically be called during Tenant Registration.
  // Here we just validate the code exists.
  async validateReferralCode(code: string) {
    // We treat the code as the resellerId (UUID) directly for simplicity,
    // as the schema does not have a separate `referralCode` on ResellerProfile.
    // In a real app, ResellerProfile might have a `code` field.
    return this.prisma.resellerProfile.findFirst({
      where: {
         OR: [
           { id: code },
           { userId: code }
         ]
      },
    });
  }

  // 2. Dashboard API
  async getDashboardStats(userId: string) {
    const profile = await this.prisma.resellerProfile.findUnique({
      where: { userId },
      include: {
        referrals: {
          include: {
            tenant: true
          }
        }
      }
    });

    if (!profile) {
      return { totalEarnings: 0, pendingPayouts: 0, referrals: [] };
    }

    return {
      totalEarnings: profile.totalEarnings,
      pendingPayouts: profile.pendingPayouts,
      referrals: profile.referrals.map(r => ({
        schoolName: r.tenant.name,
        linkedAt: r.linkedAt,
        status: r.tenant.subscriptionStatus
      }))
    };
  }
}
