import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SocialAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async trackClick(slug: string, userAgent: string): Promise<void> {
    const artifact = await this.prisma.socialArtifact.findUnique({
      where: { publicSlug: slug },
    });

    if (!artifact) {
      // If artifact not found, we might ignore or log warning.
      // For now, ignore to avoid errors on invalid slugs.
      return;
    }

    // Identify Platform
    let platform = 'BROWSER';
    const ua = userAgent.toLowerCase();
    if (ua.includes('whatsapp')) {
      platform = 'WHATSAPP';
    } else if (ua.includes('facebook') || ua.includes('fbav')) {
      platform = 'FACEBOOK';
    } else if (ua.includes('twitter')) {
      platform = 'TWITTER';
    }
    // Add more detectors as needed

    // Increment Click Count (Upsert to handle new platform for this artifact)
    await this.prisma.shareAnalytics.upsert({
      where: {
        artifactId_platform: {
          artifactId: artifact.id,
          platform: platform,
        },
      },
      create: {
        artifactId: artifact.id,
        platform: platform,
        clickCount: 1,
      },
      update: {
        clickCount: { increment: 1 },
      },
    });
  }

  async calculateKFactor(artifactId: string): Promise<number> {
    const analytics = await this.prisma.shareAnalytics.findMany({
      where: { artifactId: artifactId },
    });

    const totalClicks = analytics.reduce((sum, record) => sum + record.clickCount, 0);
    const totalShares = analytics.reduce((sum, record) => sum + record.shareCount, 0);

    // K-Factor = Total Clicks / Total Shares
    // Avoid division by zero
    if (totalShares === 0) return 0;

    return parseFloat((totalClicks / totalShares).toFixed(2));
  }
}
