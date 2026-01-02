import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class SocialService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Creates a public share link for a student result.
   * @param studentId The ID of the student.
   * @param examId Optional exam ID to contextually link.
   * @returns The generated public URL.
   */
  async createShareLink(studentId: string, examId?: string): Promise<string> {
    const slug = randomUUID(); // In real app, maybe shortid or similar

    if (process.env.DATABASE_URL) {
      await this.prisma.socialArtifact.create({
        data: {
          studentId,
          publicSlug: slug,
          metadata: examId ? { examId } : {},
          // expiry: ... default 30 days?
        },
      });
    } else {
        console.warn('DB not available, skipping SocialArtifact persistence.');
    }

    // Assuming frontend is served at /r/:slug
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/r/${slug}`;
  }

  /**
   * Generates an OG Image for the student.
   * @param studentId The student ID.
   * @returns A Buffer containing the image data.
   */
  async getOgImage(studentId: string): Promise<Buffer> {
    // In a real implementation, this would:
    // 1. Fetch student name and exam details from DB.
    // 2. Use canvas or playwright/puppeteer to render an image template.
    // 3. Return the image buffer.

    // For Verification: We simulate this by returning a dummy buffer and logging.

    let studentName = 'Student';
    if (process.env.DATABASE_URL) {
       const student = await this.prisma.student.findUnique({ where: { id: studentId } });
       if (student) {
           studentName = `${student.firstName} ${student.lastName}`;
       }
    }

    console.log(`Generating OG Image for ${studentName} (${studentId})...`);

    // Create a 1x1 pixel PNG buffer as a placeholder
    // minimal valid PNG header
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

    return pngBuffer;
  }
}
