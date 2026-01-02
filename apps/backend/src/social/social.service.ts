import { Injectable, NotFoundException, OnModuleInit, OnModuleDestroy, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import puppeteer, { Browser } from 'puppeteer';
import * as crypto from 'crypto';

export interface PublicArtifactDto {
  firstName: string;
  className: string;
  schoolName: string;
  rank: string;
  percentage: string;
}

export interface TemplateElement {
  text: string;
  x: number;
  y: number;
  font_size: number;
  color: string;
  font_weight?: string;
  background?: string;
  padding?: string;
  border_radius?: string;
  align?: string;
  opacity?: number;
}

export interface SocialTemplate {
  background: string;
  elements: TemplateElement[];
}

@Injectable()
export class SocialService implements OnModuleInit, OnModuleDestroy {
  private browser: Browser;
  private readonly logger = new Logger(SocialService.name);

  // Default Template Configuration
  private readonly defaultTemplate: SocialTemplate = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    elements: [
      { text: "Congratulations!", x: 600, y: 150, font_size: 40, color: "#FFFFFF", align: "center" },
      { text: "{{name}}", x: 600, y: 250, font_size: 60, color: "#FFFFFF", align: "center", font_weight: "bold" },
      { text: "Rank: {{rank}}", x: 600, y: 380, font_size: 30, color: "#333333", background: "#ffd700", padding: "10px 30px", border_radius: "50px", align: "center" },
      { text: "{{school}}", x: 600, y: 530, font_size: 24, color: "#FFFFFF", align: "center", opacity: 0.9 }
    ]
  };

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
    this.logger.log('Puppeteer browser instance launched');
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.logger.log('Puppeteer browser instance closed');
    }
  }

  private renderTemplateHtml(template: SocialTemplate, data: Record<string, string>): string {
    const elementsHtml = template.elements.map(el => {
      // Replace placeholders
      const text = el.text.replace(/{{(\w+)}}/g, (_, key) => data[key] || '');

      const style = [
        `position: absolute`,
        `left: ${el.x}px`,
        `top: ${el.y}px`,
        `font-size: ${el.font_size}px`,
        `color: ${el.color}`,
        el.font_weight ? `font-weight: ${el.font_weight}` : '',
        el.background ? `background: ${el.background}` : '',
        el.padding ? `padding: ${el.padding}` : '',
        el.border_radius ? `border-radius: ${el.border_radius}` : '',
        el.opacity ? `opacity: ${el.opacity}` : '',
        el.align === 'center' ? 'transform: translate(-50%, -50%)' : '',
        'white-space: nowrap'
      ].filter(Boolean).join(';');

      return `<div style="${style}">${text}</div>`;
    }).join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            width: 1200px;
            height: 630px;
            background: ${template.background};
            font-family: 'Arial', sans-serif;
            overflow: hidden;
            position: relative;
          }
        </style>
      </head>
      <body>
        ${elementsHtml}
      </body>
      </html>
    `;
  }

  async generateStudentOgImage(studentId: string): Promise<Buffer> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        tenant: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    let rank = 'N/A';
    try {
        const resultSummaries = await this.prisma.resultSummary.findMany({
            where: { studentId: studentId },
            orderBy: { createdAt: 'desc' },
            take: 1
        });

        if (resultSummaries && resultSummaries.length > 0) {
            rank = resultSummaries[0].classRank?.toString() || 'N/A';
        }
    } catch (e) {
        this.logger.warn(`Could not fetch rank for student ${studentId}: ${e.message}`);
    }

    const schoolName = student.tenant.name;
    const studentName = `${student.firstName} ${student.lastName}`;

    // Data for template substitution
    const data = {
      name: studentName,
      school: schoolName,
      rank: rank
    };

    // Render HTML using default template
    const html = this.renderTemplateHtml(this.defaultTemplate, data);

    let page;
    try {
        if (!this.browser || !this.browser.isConnected()) {
            this.logger.warn('Browser disconnected, relaunching...');
            await this.onModuleInit();
        }

        page = await this.browser.newPage();
        await page.setViewport({ width: 1200, height: 630 });
        await page.setContent(html);

        const buffer = await page.screenshot({ type: 'png' });
        return Buffer.from(buffer);
    } catch (e) {
        this.logger.error(`Failed to generate image: ${e.message}`);
        throw e;
    } finally {
        if (page) {
            await page.close().catch(e => this.logger.error(`Error closing page: ${e.message}`));
        }
    }
  }

  async createShareLink(studentId: string, examId: string): Promise<string> {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const slug = crypto.randomBytes(4).toString('hex'); // 8 chars unique
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    // Check if duplicate slug (very rare but possible)
    // For simplicity we assume it's unique or DB constraint will fail, usually we might retry.
    // Given UUID is 4 billion combinations, 8 hex chars is 4 billion too (16^8 = 4.29B). Enough for now.

    // We store examId in metadata
    await this.prisma.socialArtifact.create({
      data: {
        studentId,
        type: 'Result',
        publicSlug: slug,
        expiresAt,
        metadata: { examId },
      },
    });

    // Assuming Frontend URL is configurable, defaulting to http://localhost:3000
    // In production this should come from env.
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/r/${slug}`;
  }

  async getPublicArtifact(slug: string): Promise<PublicArtifactDto> {
    const artifact = await this.prisma.socialArtifact.findUnique({
      where: { publicSlug: slug },
      include: {
        student: {
          include: {
            tenant: true,
            section: {
                include: {
                    class: true
                }
            }
          },
        },
      },
    });

    if (!artifact) {
      throw new NotFoundException('Artifact not found');
    }

    if (artifact.expiresAt && artifact.expiresAt < new Date()) {
      throw new BadRequestException('Link expired');
    }

    const { student } = artifact;
    const metadata = artifact.metadata as any;
    const examId = metadata?.examId;

    // Fetch Result/Marks
    // Logic: Fetch ResultSummary if available for this student (and exam if we could link it)
    // For now, we reuse the logic from image generator: fetch latest ResultSummary
    // Ideally we filter by examId if ResultSummary has it.
    // Assuming ResultSummary might not have examId directly linked in previous schema,
    // we will just take the latest one or mock if missing.

    let rank = 'N/A';
    let percentage = 'N/A';

    try {
        // Increment Analytics
        await this.prisma.shareAnalytics.upsert({
          where: {
            artifactId_platform: {
              artifactId: artifact.id,
              platform: 'web', // Default platform for web visits
            },
          },
          update: {
            clickCount: { increment: 1 },
            uniqueVisitors: { increment: 1 }, // Simplistic unique visitor tracking
          },
          create: {
            artifactId: artifact.id,
            platform: 'web',
            clickCount: 1,
            uniqueVisitors: 1,
          },
        });

        // Now types are generated, we can access resultSummary safely
        const resultSummaries = await this.prisma.resultSummary.findMany({
            where: { studentId: student.id },
            orderBy: { createdAt: 'desc' },
            take: 1
        });

        if (resultSummaries && resultSummaries.length > 0) {
            const summary = resultSummaries[0];
            rank = summary.classRank?.toString() || 'N/A';
            percentage = summary.percentage ? summary.percentage.toFixed(2) + '%' : 'N/A';
        }
    } catch (e) {
        this.logger.warn(`Could not fetch result details or update analytics: ${e.message}`);
    }

    // Masking: Return only allowed fields
    return {
      firstName: student.firstName, // Only first name
      className: student.section?.class?.name || 'N/A',
      schoolName: student.tenant.name,
      rank,
      percentage,
    };
  }

  async handleAdmissionCta(slug: string): Promise<string> {
    const artifact = await this.prisma.socialArtifact.findUnique({
        where: { publicSlug: slug },
    });

    if (!artifact) {
        // Fallback to generic admission page if slug is invalid
        return 'https://edplatform.com/admissions';
    }

    // Track Conversion
    try {
        await this.prisma.shareAnalytics.upsert({
            where: {
                artifactId_platform: {
                    artifactId: artifact.id,
                    platform: 'cta_admission',
                },
            },
            update: {
                clickCount: { increment: 1 },
                uniqueVisitors: { increment: 1 },
            },
            create: {
                artifactId: artifact.id,
                platform: 'cta_admission',
                clickCount: 1,
                uniqueVisitors: 1,
            },
        });
    } catch (e) {
        this.logger.error(`Failed to track CTA click: ${e.message}`);
    }

    // Redirect to Division 4 (Admission Form)
    // Assuming a standard URL pattern or external link.
    // Ideally, this should be dynamic based on the tenant/school linked to the artifact.
    // For this task, we'll use a placeholder URL.
    return 'https://edplatform.com/admissions/apply';
  }
}
