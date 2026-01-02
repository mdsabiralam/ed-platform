import { Injectable, NotFoundException, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import puppeteer, { Browser } from 'puppeteer';

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
        const resultSummaries = await (this.prisma as any).resultSummary.findMany({
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
}
