import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { SocialAnalyticsService } from '../services/social-analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('social')
export class SocialController {
  constructor(
    private readonly analyticsService: SocialAnalyticsService,
    private readonly prisma: PrismaService
  ) {}

  @Get('public/:slug')
  async getPublicResult(@Param('slug') slug: string) {
    // This endpoint represents visiting the link.
    // The middleware tracks the click.
    // Logic to return result data would be here.
    return { message: 'Public Result Data', slug };
  }

  @Post('share/create-link')
  async createShareLink(@Body() body: { studentId: string }) {
    // Mock logic to create a link
    // In real app, create SocialArtifact
    const artifact = await this.prisma.socialArtifact.create({
        data: {
            studentId: body.studentId,
            publicSlug: `result-${body.studentId}-${Date.now()}`,
            metadata: {},
        }
    });

    // We might increment share count here if "create link" implies a share intent
    // But typically share count is tracked when user actually shares.
    // For K-Factor = Clicks / Shares, we need to track shares.
    // Let's create an initial analytics record with shareCount=1 if this is a "Share" action.

    await this.prisma.shareAnalytics.upsert({
        where: { artifactId_platform: { artifactId: artifact.id, platform: 'WHATSAPP' } }, // Assumption
        create: { artifactId: artifact.id, platform: 'WHATSAPP', shareCount: 1 },
        update: { shareCount: { increment: 1 } }
    });

    return { url: `https://ed.app/r/${artifact.publicSlug}` };
  }
}
