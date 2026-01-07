
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BroadsheetService {
  constructor(private readonly prisma: PrismaService) {}

  async generateClassBroadsheet(classId: string, res: Response) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Broadsheet');

    // Headers
    // In a real app, we would fetch distinct subjects for the class to build columns dynamically.
    // For this implementation, we assume a fixed set or fetch them.
    // Let's fetch subjects linked to exams for this class.

    // Step 1: Fetch Exams for the class to get Subjects
    const exams = await (this.prisma as any).exam.findMany({
        where: { classId },
        include: { subject: true }
    });

    // Unique subjects
    const subjectsMap = new Map();
    exams.forEach(e => subjectsMap.set(e.subjectId, e.subject.name));

    const subjectColumns = Array.from(subjectsMap.entries()).map(([id, name]) => ({
        header: name, key: `sub_${id}`, width: 15
    }));

    worksheet.columns = [
      { header: 'Roll No', key: 'roll', width: 10 },
      { header: 'Name', key: 'name', width: 30 },
      ...subjectColumns,
      { header: 'Total', key: 'total', width: 10 },
    ];

    // Step 2: Fetch Students with Marks
    const students = await (this.prisma as any).student.findMany({
        where: {
             section: { classId: classId }
        },
        include: {
            user: true,
            // We need marks, but standard Prisma relation might be tricky without generated client.
            // Assuming 'marks' relation exists on Student or we fetch separately.
            // Let's assume we can fetch marks manually if relation isn't easy to infer in 'any' mode.
        }
    });

    // Bulk fetch marks for all students in class
    const studentIds = students.map(s => s.id);
    const allMarks = await (this.prisma as any).studentMark.findMany({
        where: {
            studentId: { in: studentIds },
            exam: { classId: classId }
        },
        include: { exam: true }
    });

    // Group marks by student
    const marksByStudent = new Map();
    allMarks.forEach(m => {
        if (!marksByStudent.has(m.studentId)) marksByStudent.set(m.studentId, []);
        marksByStudent.get(m.studentId).push(m);
    });

    // Populate Rows
    for (const student of students) {
        const row: any = {
            roll: student.rollNo,
            name: student.firstName + ' ' + student.lastName,
            total: 0
        };

        const studentMarks = marksByStudent.get(student.id) || [];

        studentMarks.forEach(mark => {
            const subjectId = mark.exam.subjectId;
            const key = `sub_${subjectId}`;

            // If multiple exams per subject (e.g. Terms), we might sum them or take latest.
            // Assuming simple aggregation: sum obtained marks for the subject key.
            row[key] = (row[key] || 0) + mark.obtainedMarks;
            row.total += mark.obtainedMarks;
        });

        worksheet.addRow(row);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=broadsheet.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }
}
