import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { Readable } from 'stream';

@Injectable()
export class BroadsheetService {
  constructor(private readonly prisma: PrismaService) {}

  async generateBroadsheet(classId: string, examTermId: string): Promise<Readable> {
    const students = await this.prisma.student.findMany({
      where: {
        section: {
          classId: classId,
        },
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
      orderBy: {
        rollNo: 'asc', // Assuming rollNo exists and is sortable
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Broadsheet');

    // Define Columns
    // Static columns + Dynamic Subject columns
    const columns = [
      { header: 'Admission No', key: 'admissionNo', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Roll No', key: 'rollNo', width: 10 },
    ];

    // Collect all subjects to create columns
    const subjectMap = new Map<string, string>(); // subjectId -> subjectName
    students.forEach(student => {
      student.marks.forEach(mark => {
        if (!subjectMap.has(mark.exam.subjectId)) {
          subjectMap.set(mark.exam.subjectId, mark.exam.subject.name);
        }
      });
    });

    const subjectIds = Array.from(subjectMap.keys());
    subjectIds.forEach(subId => {
      columns.push({ header: subjectMap.get(subId) || 'Unknown', key: `sub_${subId}`, width: 15 });
    });

    columns.push({ header: 'Total', key: 'total', width: 10 });
    columns.push({ header: 'Percentage', key: 'percentage', width: 12 });
    columns.push({ header: 'Rank', key: 'rank', width: 10 });

    worksheet.columns = columns;

    // Add Rows
    // Need to calculate ranks first?
    const processedStudents = students.map(student => {
      let totalMarks = 0;
      let maxTotal = 0;
      const rowData: any = {
        admissionNo: student.admissionNo,
        name: `${student.firstName} ${student.lastName}`,
        rollNo: student.rollNo,
      };

      student.marks.forEach(mark => {
        rowData[`sub_${mark.exam.subjectId}`] = mark.total;
        totalMarks += mark.total;
        maxTotal += mark.exam.maxMarks;
      });

      rowData['total'] = totalMarks;
      rowData['percentage'] = maxTotal > 0 ? ((totalMarks / maxTotal) * 100).toFixed(2) : '0.00';

      return rowData;
    });

    // Sort by Total Descending to assign rank (Simple ranking)
    processedStudents.sort((a, b) => b.total - a.total);

    processedStudents.forEach((student, index) => {
      student.rank = index + 1;
      worksheet.addRow(student);
    });

    // Write to stream
    const buffer = await workbook.xlsx.writeBuffer();
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}
