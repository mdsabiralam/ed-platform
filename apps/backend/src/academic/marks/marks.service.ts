import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';

@Injectable()
export class MarksService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async bulkUpload(fileBuffer: Buffer) {
    // Parse CSV
    const records = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const validatedMarks: any[] = [];

    // Iterate and Validate
    for (const record of records as any[]) {
      const studentId = record.studentId;
      const examId = record.examId;
      const marks = parseFloat(record.marks);
      const maxMarks = parseFloat(record.maxMarks);

      if (isNaN(marks) || isNaN(maxMarks)) {
          throw new BadRequestException(`Invalid number format for student ${studentId}`);
      }

      // Check Constraint: Marks <= Max Marks
      if (marks > maxMarks) {
        throw new BadRequestException('Validation Error: Marks cannot exceed Max Marks');
      }

      // Additional Check: Non-negative
      if (marks < 0) {
        throw new BadRequestException('Validation Error: Marks cannot be negative');
      }

      validatedMarks.push({
        studentId,
        examId,
        marksObtained: marks,
        // We might want to persist maxMarks or just validate against it.
        // Assuming we update the StudentMark table.
      } as any);
    }

    // Process Validated Data (Simulated Persistence)
    if (process.env.DATABASE_URL) {
        // Logic to upsert into DB would go here
        // for (const m of validatedMarks) { ... }
        console.log(`Processed ${validatedMarks.length} records successfully.`);
    }

    return { count: validatedMarks.length, status: 'Success' };
  }
}
