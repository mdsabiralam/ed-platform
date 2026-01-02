import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSectionToppers(sectionId: string, examTermId: string) {
    if (!sectionId || !examTermId) {
      throw new Error('sectionId and examTermId are required');
    }

    // 1. Fetch students in the section with marks for the term
    const students = await this.prisma.student.findMany({
      where: {
        sectionId: sectionId,
      },
      include: {
        marks: {
          where: {
            exam: {
              examTermId: examTermId,
            },
          },
          include: {
            exam: true,
          },
        },
      },
    });

    if (!students || students.length === 0) {
      return [];
    }

    // 2. Calculate total marks for each student
    const studentTotals = students.map((student) => {
      let totalMarks = 0;
      let totalMaxMarks = 0;

      for (const mark of student.marks) {
        totalMarks += (mark.theoryMarks || 0) + (mark.practicalMarks || 0);
        totalMaxMarks += (mark.exam.maxTheory || 0) + (mark.exam.maxPractical || 0);
      }

      return {
        studentId: student.id,
        name: `${student.firstName} ${student.lastName}`,
        admissionNo: student.admissionNo,
        totalMarks,
        totalMaxMarks,
        marks: student.marks, // Keep marks for potential drill-down later
      };
    });

    // 3. Sort by total marks descending
    studentTotals.sort((a, b) => b.totalMarks - a.totalMarks);

    // 4. Assign ranks handling ties
    const rankedStudents = [];
    let currentRank = 1;

    for (let i = 0; i < studentTotals.length; i++) {
      if (i > 0 && studentTotals[i].totalMarks < studentTotals[i - 1].totalMarks) {
        currentRank = rankedStudents[i - 1].rank + 1;
        // In dense ranking, ties share rank, next is currentRank + 1?
        // Or standard competition ranking: 1, 1, 3?
        // Requirement: "Handle ties: If two students have the same total, they share the rank."
        // Usually implies: 1, 1, 3.
        // Let's implement standard competition ranking (1, 1, 3).
        currentRank = i + 1;
      } else if (i > 0 && studentTotals[i].totalMarks === studentTotals[i - 1].totalMarks) {
         currentRank = rankedStudents[i - 1].rank;
      }

      rankedStudents.push({
        ...studentTotals[i],
        rank: currentRank,
      });
    }

    // 5. Return Top 3 Students (Rank <= 3)
    return rankedStudents.filter((s) => s.rank <= 3);
  }
}
