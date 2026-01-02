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
    // 6.I.10: PII Safety Test
    // Fetch Artifact and Student Data
    const artifact = await this.prisma.socialArtifact.findUnique({
        where: { publicSlug: slug },
        include: {
            student: {
                select: {
                    firstName: true,
                    lastName: true,
                    admissionNo: true,
                    // Explicitly NOT selecting: phone, email, address, dob, healthProfile
                    tenant: {
                        select: {
                            name: true,
                            logoUrl: true
                        }
                    }
                }
            }
        }
    });

    if (!artifact) {
        return { message: 'Result not found' };
    }

    // Return only safe data
    return {
        studentName: `${artifact.student.firstName} ${artifact.student.lastName}`,
        schoolName: artifact.student.tenant.name,
        schoolLogo: artifact.student.tenant.logoUrl,
        // Mock result data for now as Result summary linking is separate
        resultSummary: {
            percentage: 85.5,
            rank: 2,
            status: 'PASS'
        }
    };
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
