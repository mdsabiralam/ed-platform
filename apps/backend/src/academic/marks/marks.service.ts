
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { parse } from 'csv-parse/sync';

@Injectable()
export class MarksService {
    constructor(private readonly prisma: PrismaService) {}

    async processBulkUpload(fileBuffer: Buffer) {
        let records;
        try {
            records = parse(fileBuffer, {
                columns: true,
                skip_empty_lines: true,
                trim: true
            });
        } catch (e) {
            throw new BadRequestException('Invalid CSV format');
        }

        const validMarks: any[] = []; // Explicitly type as any array to avoid 'never' inference issue

        for (const record of records) {
            const marks = parseFloat(record.marks);
            const maxMarks = parseFloat(record.maxMarks);

            if (isNaN(marks) || isNaN(maxMarks)) {
                throw new BadRequestException(`Invalid numeric values for student ${record.studentId}`);
            }

            if (marks > maxMarks) {
                throw new BadRequestException(`Validation Error: Marks (${marks}) cannot exceed Max Marks (${maxMarks}) for student ${record.studentId}`);
            }

            validMarks.push({
                studentId: record.studentId,
                examId: record.examId,
                obtainedMarks: marks
            });
        }

        // Using transaction
        return (this.prisma as any).$transaction(async (tx) => {
             for (const mark of validMarks) {
                 await tx.studentMark.create({
                     data: {
                         studentId: mark.studentId,
                         examId: mark.examId,
                         obtainedMarks: mark.obtainedMarks
                     }
                 });
             }
             return { count: validMarks.length };
        });
    }
}
