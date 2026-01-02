import { Injectable, NotFoundException, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class SocialService implements OnModuleInit, OnModuleDestroy {
  private browser: Browser;
  private readonly logger = new Logger(SocialService.name);

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

    // Try to get rank from ResultSummary if available
    // We fetch the latest ResultSummary for this student
    let rank = 'N/A';
    try {
        // Checking if we can access result summaries.
        // Using 'any' cast to avoid TS errors if ResultSummary type is not yet fully generated in client
        // but likely exists in DB.
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

    // HTML Template with placeholders
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            width: 1200px;
            height: 630px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            width: 80%;
            text-align: center;
            border: 2px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          }
          h1 {
            font-size: 60px;
            margin: 0 0 20px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          h2 {
            font-size: 40px;
            margin: 10px 0;
            font-weight: normal;
          }
          .badge {
            background: #ffd700;
            color: #333;
            padding: 10px 30px;
            border-radius: 50px;
            font-size: 30px;
            font-weight: bold;
            display: inline-block;
            margin-top: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          }
          .school {
            margin-top: 40px;
            font-size: 24px;
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Congratulations!</h2>
          <h1 id="studentName"></h1>

          <div class="badge">
             Rank: <span id="rank"></span>
          </div>

          <div class="school" id="schoolName"></div>
        </div>
      </body>
      </html>
    `;

    let page;
    try {
        if (!this.browser || !this.browser.isConnected()) {
            this.logger.warn('Browser disconnected, relaunching...');
            await this.onModuleInit();
        }

        page = await this.browser.newPage();
        await page.setViewport({ width: 1200, height: 630 });
        await page.setContent(htmlTemplate);

        // Safely inject content
        await page.evaluate((sName, sRank, scName) => {
          const elName = document.getElementById('studentName');
          if (elName) elName.textContent = sName;

          const elRank = document.getElementById('rank');
          if (elRank) elRank.textContent = sRank;

          const elSchool = document.getElementById('schoolName');
          if (elSchool) elSchool.textContent = scName;
        }, studentName, rank, schoolName);

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
