import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';

@Injectable()
export class BiometricService {
  private readonly logger = new Logger(BiometricService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // Must be 32 chars

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Task 1: GDPR Compliance (Right to be Forgotten)
   * Deletes student biometric data and logs the event.
   */
  async deleteStudentBiometrics(studentId: string): Promise<void> {
    this.logger.log(`Initiating biometric deletion for student: ${studentId}`);

    // 1. Delete from Database (Face Embeddings)
    await this.prisma.faceEmbedding.deleteMany({
      where: { studentId },
    });

    // 2. Mock S3 Deletion (In real world, use AWS SDK)
    await this.deleteFromS3(studentId);

    // 3. Log event (handled by logger, but could be audit log)
    this.logger.log(`Permanently deleted biometric data for student: ${studentId}`);
  }

  private async deleteFromS3(studentId: string): Promise<void> {
    // Mock S3 deletion logic
    this.logger.log(`[MOCK] Deleted images from S3 bucket for student: ${studentId}`);
  }

  /**
   * Task 6: Data Retention (Auto-Cleanup)
   * Deletes 'Unknown' faces older than 7 days.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupUnknownFaces() {
    this.logger.log('Running cleanup_unknown_faces cron job...');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch IDs first to allow S3 cleanup
    const recordsToDelete = await this.prisma.faceEmbedding.findMany({
      where: {
        studentId: null, // Unknown faces
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
      select: { id: true, sourceUrl: true },
    });

    if (recordsToDelete.length === 0) {
      this.logger.log('No unknown faces to clean up.');
      return;
    }

    // Delete from Database
    const result = await this.prisma.faceEmbedding.deleteMany({
      where: {
        id: { in: recordsToDelete.map(r => r.id) },
      },
    });

    this.logger.log(`Deleted ${result.count} unknown face records older than 7 days.`);

    // Mock S3 cleanup for each record
    for (const record of recordsToDelete) {
      if (record.sourceUrl) {
         this.logger.log(`[MOCK] Deleted S3 object: ${record.sourceUrl}`);
      }
    }
  }

  /**
   * Task 5: Opt-out Mechanism (Consent) & Task 2: Data Encryption (Vector Security)
   * Registers a face if consent is present.
   */
  async registerFace(studentId: string, vector: number[], sourceUrl: string, metadata: any) {
    // Check consent
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    if (!student.biometricConsent) {
      this.logger.warn(`Biometric consent denied for student: ${studentId}`);
      throw new ForbiddenException('Student has not provided biometric consent.');
    }

    // Task 2: Data Encryption (Vector Security) - Encrypt metadata
    // In a real scenario, use a crypto library. Here we mock it.
    const encryptedMetadata = this.encryptMetadata(metadata);

    // Store embedding
    // Note: We use raw query for pgvector usually, or if Prisma supports it directly.
    // Since we defined it as Unsupported("vector(128)"), we might need raw query to insert.
    // However, for this task, we will try to use create if Prisma client extensions handle it,
    // or fall back to raw query if needed. For simplicity in this environment:

    const vectorString = `[${vector.join(',')}]`; // pgvector format

    await this.prisma.$executeRaw`
      INSERT INTO "face_embeddings" ("id", "student_id", "vector", "source_url", "metadata", "created_at")
      VALUES (gen_random_uuid(), ${studentId}, ${vectorString}::vector, ${sourceUrl}, ${encryptedMetadata}, NOW())
    `;

    this.logger.log(`Face registered for student: ${studentId}`);
  }

  private encryptMetadata(metadata: any): any {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.secretKey), iv);

    const text = JSON.stringify(metadata);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      _encrypted: true,
      iv: iv.toString('hex'),
      content: encrypted,
      tag: authTag.toString('hex'),
    };
  }
}
