import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSectionToppers(sectionId: string, examTermId: string) {
    // 1. Fetch all students in the section
    // 2. Calculate total marks for the given term for each student
    // 3. Sort descending
    // 4. Return top 3

    // Optimized query using aggregation if possible, or fetch and process
    // Let's fetch marks
    const students = await this.prisma.student.findMany({
      where: { sectionId },
      include: {
        marks: {
          where: {
            exam: {
              examTermId: examTermId,
            },
          },
        },
      },
    });

    const studentScores = students.map((student) => {
      const totalMarks = student.marks.reduce((sum, mark) => sum + mark.total, 0);
      return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        admissionNo: student.admissionNo,
        totalMarks,
      };
    });

    // Sort by totalMarks desc
    studentScores.sort((a, b) => b.totalMarks - a.totalMarks);

    // Get top 3 (handling ties could be complex, simple slice for now as per "top 3")
    return studentScores.slice(0, 3);
  }
}
