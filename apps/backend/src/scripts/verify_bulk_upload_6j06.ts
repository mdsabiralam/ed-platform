import { MarksController } from '../academic/marks/marks.controller';
import { MarksService } from '../academic/marks/marks.service';
import { BadRequestException } from '@nestjs/common';

async function verifyBulkUpload() {
  console.log('Verifying Bulk Upload Validation...');

  const service = new MarksService();
  const controller = new MarksController(service);

  // 1. Create a CSV file content where one student has scored 105 (Max Marks is 100).
  const csvContent = `studentId,examId,marks,maxMarks
student-1,exam-1,105,100
student-2,exam-1,90,100`;

  const fileBuffer = Buffer.from(csvContent);
  const mockFile: any = {
    buffer: fileBuffer,
    originalname: 'marks.csv',
    mimetype: 'text/csv',
  };

  // 2. Upload this file via POST /api/academic/marks/bulk-upload (Simulated call)
  console.log('\n--- Test: Upload Invalid Marks (105 > 100) ---');

  try {
    await controller.bulkUpload(mockFile);
    console.error('FAIL: Upload should have been rejected but succeeded.');
    process.exit(1);
  } catch (error) {
    // 3. The system MUST reject the row or the entire file.
    // 4. Return a "Validation Error" specifically stating "Marks cannot exceed Max Marks".
    if (error instanceof BadRequestException) {
       console.log(`Caught Expected Exception: ${error.message}`);

       if (error.message === 'Validation Error: Marks cannot exceed Max Marks') {
           console.log('PASS: Correct error message returned.');
       } else {
           console.error(`FAIL: Incorrect error message. Expected "Validation Error: Marks cannot exceed Max Marks", got "${error.message}"`);
           process.exit(1);
       }
    } else {
       console.error('FAIL: Unexpected error type:', error);
       process.exit(1);
    }
  }

  console.log('\nSUCCESS: Bulk Upload Validation verified.');
}

verifyBulkUpload();
