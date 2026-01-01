import { Injectable } from '@nestjs/common';
import { MarksheetLayout } from '../interfaces/marksheet-layout.interface';

@Injectable()
export class PdfGeneratorService {
  generatePdf(layout: MarksheetLayout) {
    // 6.F.04: Dynamic Columns Support
    // Check if 'attendance' is in visible_columns
    const showAttendance = layout.marksTable.visible_columns.includes('attendance');

    if (showAttendance) {
        console.log('Rendering Attendance Column');
        // Add PDF generation logic here
    }

    // Render other columns based on visible_columns array
    layout.marksTable.visible_columns.forEach(col => {
        console.log(`Rendering ${col} column`);
    });
  }
}
