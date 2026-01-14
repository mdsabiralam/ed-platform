import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class BroadsheetService {
  async generateBroadsheet(sectionId: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Broadsheet');

    // In a real implementation, we would fetch data from DB using sectionId
    // For now, we mock the data generation based on the requirements.

    // Mock Data
    const subjects = ['Math', 'Science', 'English', 'History'];
    const students = Array.from({ length: 10 }, (_, i) => ({
      rollNo: i + 1,
      name: `Student ${i + 1}`,
      marks: subjects.map(() => Math.floor(Math.random() * 100)),
    }));

    // Columns: Roll, Name, ...Subjects, Total, Rank
    const columns = [
      { header: 'Roll No', key: 'rollNo', width: 10 },
      { header: 'Name', key: 'name', width: 20 },
      ...subjects.map(sub => ({ header: sub, key: sub.toLowerCase(), width: 15 })),
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Rank', key: 'rank', width: 10 },
    ];

    worksheet.columns = columns;

    // Process Students
    const processedStudents = students.map(student => {
      const total = student.marks.reduce((a, b) => a + b, 0);
      const row: any = {
        rollNo: student.rollNo,
        name: student.name,
        total: total,
      };

      subjects.forEach((sub, idx) => {
        row[sub.toLowerCase()] = student.marks[idx];
      });

      return { ...row, rawTotal: total }; // Keep raw total for ranking
    });

    // Rank Logic
    processedStudents.sort((a, b) => b.rawTotal - a.rawTotal);
    let currentRank = 1;
    processedStudents.forEach((student, index) => {
      if (index > 0 && student.rawTotal < processedStudents[index - 1].rawTotal) {
        currentRank = index + 1;
      }
      student.rank = currentRank;
    });

    // Add Rows
    // We need to add them sorted by Roll No probably? Usually Broadsheet is by Roll No.
    // But Ranks are calculated. Let's sort back by Roll No for display.
    processedStudents.sort((a, b) => a.rollNo - b.rollNo);

    processedStudents.forEach(student => {
      // Remove internal helper field
      const { rawTotal, ...displayData } = student;
      worksheet.addRow(displayData);
    });

    return await workbook.xlsx.writeBuffer() as any;
  }
}
