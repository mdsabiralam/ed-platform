import { BroadsheetService } from '../academic/analytics/broadsheet/broadsheet.service';
import * as ExcelJS from 'exceljs';

async function verifyBroadsheet() {
  console.log('Verifying Broadsheet Export...');

  const service = new BroadsheetService();
  const buffer = await service.generateBroadsheet('section-123');

  // 1. Parse generated Excel
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);
  const worksheet = workbook.getWorksheet('Broadsheet');

  if (!worksheet) {
    console.error('FAIL: Worksheet "Broadsheet" not found.');
    process.exit(1);
  }

  // 2. Verify Columns
  const expectedHeaders = ['Roll No', 'Name', 'Math', 'Science', 'English', 'History', 'Total', 'Rank'];
  const actualHeaders: string[] = [];
  worksheet.getRow(1).eachCell((cell) => {
    actualHeaders.push(cell.value as string);
  });

  console.log('Columns Found:', actualHeaders.join(', '));

  const missing = expectedHeaders.filter(h => !actualHeaders.includes(h));
  if (missing.length > 0) {
    console.error(`FAIL: Missing columns: ${missing.join(', ')}`);
    process.exit(1);
  } else {
    console.log('PASS: All required columns exist.');
  }

  // 3. Spot Check Row 5
  // Row 1 is Header. Row 5 is Student #4.
  const rowIdx = 5;
  const targetRow = worksheet.getRow(rowIdx);

  // Use column keys if available, or fallback to indices
  // The service defined columns with keys: 'rollNo', 'name', 'math', 'science', 'english', 'history', 'total', 'rank'
  // But exceljs usually requires accessing by key string or 1-based index.

  // Check if keys work by reading name
  const nameCell = targetRow.getCell(2); // Index 2 is Name
  const name = nameCell.value;
  console.log(`Checking Row ${rowIdx} (${name})...`);

  // We rely on indices because dynamic subjects order might vary in real scenario but here it is fixed.
  // Math(3), Science(4), English(5), History(6), Total(7)
  const sub1 = Number(targetRow.getCell(3).value); // Math
  const sub2 = Number(targetRow.getCell(4).value); // Science
  const sub3 = Number(targetRow.getCell(5).value); // English
  const sub4 = Number(targetRow.getCell(6).value); // History
  const totalCell = Number(targetRow.getCell(7).value);

  const calculatedSum = sub1 + sub2 + sub3 + sub4;

  console.log(`Marks: ${sub1} + ${sub2} + ${sub3} + ${sub4} = ${calculatedSum}`);
  console.log(`Excel Total: ${totalCell}`);

  if (calculatedSum === totalCell) {
    console.log('PASS: Row 5 Total matches sum of subjects.');
  } else {
    console.error(`FAIL: Total Mismatch. Expected ${calculatedSum}, Got ${totalCell}`);
    process.exit(1);
  }

  console.log('\nSUCCESS: Broadsheet Export verified.');
}

verifyBroadsheet();
