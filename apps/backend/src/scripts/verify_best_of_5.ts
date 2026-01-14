import { ResultService, SubjectScore } from '../academic/results/result.service';

function runVerification() {
  console.log('Verifying "Best of 5" Calculation Logic...');

  const service = new ResultService();

  // Scenario: Student has 6 subjects.
  // Scores: Math (90), Science (80), English (85), Hindi (70), Social (95), IT (60 - Lowest).
  // Assumption: Max Marks for all is 100 based on prompt saying "Percentage should be calculated based on 500".
  const scores: SubjectScore[] = [
    { subjectName: 'Math', marksObtained: 90, maxMarks: 100 },
    { subjectName: 'Science', marksObtained: 80, maxMarks: 100 },
    { subjectName: 'English', marksObtained: 85, maxMarks: 100 },
    { subjectName: 'Hindi', marksObtained: 70, maxMarks: 100 },
    { subjectName: 'Social', marksObtained: 95, maxMarks: 100 },
    { subjectName: 'IT', marksObtained: 60, maxMarks: 100 },
  ];

  const result = service.calculateBestOf5(scores);

  console.log('Input Scores:', scores.map(s => `${s.subjectName}: ${s.marksObtained}`).join(', '));
  console.log('Result:', JSON.stringify(result, null, 2));

  // Expectations:
  // 1. The system must discard 'IT' (60).
  // 2. Total should be sum of the other 5: 90+80+85+70+95 = 420.
  // 3. Percentage should be calculated based on 500, not 600. (420/500 = 84%)

  let passed = true;

  // Check 1: IT discarded
  if (result.discardedSubjects.includes('IT') && result.discardedSubjects.length === 1) {
    console.log('PASS: Correctly discarded IT.');
  } else {
    console.error(`FAIL: Expected IT to be discarded. Discarded: ${result.discardedSubjects}`);
    passed = false;
  }

  // Check 2: Total Marks
  if (result.totalMarks === 420) {
    console.log('PASS: Total marks is 420.');
  } else {
    console.error(`FAIL: Expected Total 420, got ${result.totalMarks}`);
    passed = false;
  }

  // Check 3: Percentage
  if (result.percentage === 84) {
    console.log('PASS: Percentage is 84%.');
  } else {
    console.error(`FAIL: Expected Percentage 84%, got ${result.percentage}%`);
    passed = false;
  }

  if (passed) {
    console.log('\nSUCCESS: All "Best of 5" logic tests passed.');
  } else {
    console.error('\nFAILURE: Some tests failed.');
    process.exit(1);
  }
}

runVerification();
