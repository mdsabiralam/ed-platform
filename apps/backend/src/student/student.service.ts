import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './create-student.dto';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a human-readable admission number in format "STU-{Year}-{Sequence}"
   * Example: STU-2024-0001
   * This method uses atomic updates to ensure concurrency safety.
   */
  async generateAdmissionNumber(schoolId: string, sessionYear: number): Promise<string> {
    try {
      // Upsert the sequence for this school and year.
      // We atomically increment 'lastSeq' and return the new value.
      const sequence = await this.prisma.studentSequence.upsert({
        where: {
          tenantId_year: {
            tenantId: schoolId,
            year: sessionYear,
          },
        },
        update: {
          lastSeq: { increment: 1 },
        },
        create: {
          tenantId: schoolId,
          year: sessionYear,
          lastSeq: 1,
        },
      });

      // Format: STU-2024-0001 (padded to 4 digits)
      const seqStr = sequence.lastSeq.toString().padStart(4, '0');
      return `STU-${sessionYear}-${seqStr}`;
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate admission number');
    }
  }

  async createStudent(tenantId: string, createDto: CreateStudentDto) {
    // Determine the year. Ideally, fetch the AdmissionSession to get the start year.
    // For now, we'll assume the current year or fetch session logic if available.
    // Let's assume we use the current year for the ID, or better, look up the session.

    // Fetch session to get the year (Best Practice)
    const session = await this.prisma.admissionSession.findUnique({
      where: { id: createDto.admissionSessionId },
    });

    // Default to current year if session not found (though it should be validated before)
    const year = session ? new Date(session.startDate).getFullYear() : new Date().getFullYear();

    // Generate Atomic ID
    const admissionNo = await this.generateAdmissionNumber(tenantId, year);

    // Create the student
    return this.prisma.student.create({
      data: {
        tenantId,
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        admissionSessionId: createDto.admissionSessionId,
        sectionId: createDto.sectionId,
        admissionNo,
        // Other fields would be mapped here
      },
    });
  }
}
