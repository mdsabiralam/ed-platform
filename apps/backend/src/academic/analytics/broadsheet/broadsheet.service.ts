import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class BroadsheetService {
  constructor(private prisma: PrismaService) {}

  async generateBroadsheet(classId: string, examTermId: string) {
    // 1. Fetch Students
    const students = await this.prisma.student.findMany({
      where: {
        section: {
          classId: classId,
        },
      },
      orderBy: {
        rollNo: 'asc',
      },
      include: {
        marks: {
          where: {
            exam: {
              examTermId: examTermId,
            },
          },
          include: {
            exam: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    // 2. Identify all Subjects in this Term for this Class
    // We can iterate students' marks or fetch Exams directly. Fetching exams is safer to ensure we get all subjects even if no student has marks yet (though ideally they should match).
    const exams = await this.prisma.exam.findMany({
      where: {
        classId: classId,
        examTermId: examTermId,
      },
      include: {
        subject: true,
      },
      orderBy: {
        subject: {
          name: 'asc',
        },
      },
    });

    const subjects = exams.map((e) => e.subject.name);
    const subjectMap = new Map<string, string>(); // subjectName -> examId (or we match by subject name)
    // Actually simpler to just match by subject name for column headers

    // 3. Create Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Broadsheet');

    // 4. Headers
    const headers = ['Roll No', 'Name', ...subjects, 'Total', '%', 'Rank'];
    worksheet.addRow(headers);

    // 5. Process Data
    const studentRows = [];

    for (const student of students) {
      let totalObtained = 0;
      let totalMax = 0;
      const row: any[] = [
        student.rollNo || '',
        `${student.firstName} ${student.lastName}`.trim(),
      ];

      const marksMap = new Map<string, number>(); // subjectName -> obtained

      student.marks.forEach((mark) => {
        const obtained = (mark.theoryMarks || 0) + (mark.practicalMarks || 0);
        const max = (mark.exam.maxTheory || 0) + (mark.exam.maxPractical || 0);
        marksMap.set(mark.exam.subject.name, obtained);

        // Only sum totals for subjects that exist in our main list (sanity check)
        // and assuming we want 'Total' to be sum of all obtained
        totalObtained += obtained;
        totalMax += max;
      });

      // Fill subject columns
      subjects.forEach((subj) => {
        row.push(marksMap.has(subj) ? marksMap.get(subj) : '-');
      });

      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

      row.push(totalObtained); // Total
      row.push(Number(percentage.toFixed(2))); // %

      // Store for ranking later
      studentRows.push({
        row,
        totalObtained,
        studentId: student.id,
      });
    }

    // 6. Calculate Rank
    // Sort by Total Obtained Descending
    studentRows.sort((a, b) => b.totalObtained - a.totalObtained);

    // Assign Rank
    let currentRank = 1;
    for (let i = 0; i < studentRows.length; i++) {
        if (i > 0 && studentRows[i].totalObtained < studentRows[i - 1].totalObtained) {
            currentRank = i + 1; // Standard competition ranking
        } else if (i > 0 && studentRows[i].totalObtained === studentRows[i - 1].totalObtained) {
            currentRank = studentRows[i-1].rank; // Same rank for ties
        }
        studentRows[i].rank = currentRank;
    }

    // 7. Add Rows to Worksheet (re-sorting by Roll No usually preferred for broadsheets, or keep Rank?)
    // User didn't specify sort order. Typically broadsheets are by Roll No or Name.
    // Let's sort back by Roll No (index 0) if available, or just keep rank order.
    // Usually Broadsheet is Roll No wise.
    // Let's sort by Roll No (column index 0).

    // Note: row[0] is Roll No.
    studentRows.sort((a, b) => {
        const rollA = a.row[0] || Infinity;
        const rollB = b.row[0] || Infinity;
        return rollA - rollB;
    });

    studentRows.forEach(item => {
        // Append Rank to the row data
        item.row.push(item.rank);
        worksheet.addRow(item.row);
    });

    return workbook;
  }
}
