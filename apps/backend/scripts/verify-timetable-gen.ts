// 5.J.01: Verify Full Timetable Generation (Simulation Script)
// Run with: npx ts-node apps/backend/scripts/verify-timetable-gen.ts

import { GeneticAlgorithmService, TimeSlot, Teacher, ClassGroup } from '../src/timetable/genetic-algorithm.service';

console.log('--- Starting Timetable Generation Verification ---');

async function runVerification() {
  const service = new GeneticAlgorithmService();

  // 1. Setup Mock Data
  const slots: TimeSlot[] = Array.from({ length: 5 }, (_, i) => ({
    id: `slot-${i}`,
    day: 'MONDAY',
    time: `${9 + i}:00`,
  })); // 5 slots on Monday

  const teachers: Teacher[] = [
    { id: 't1', name: 'Mr. Math', subjects: ['sub-math'] },
    { id: 't2', name: 'Ms. Sci', subjects: ['sub-sci'] },
    { id: 't3', name: 'Mr. Eng', subjects: ['sub-eng'] },
  ];

  const classes: ClassGroup[] = [
    { id: 'c1', name: 'Class 10A', subjects: ['sub-math', 'sub-sci'] }, // Needs Math & Sci
    { id: 'c2', name: 'Class 10B', subjects: ['sub-eng', 'sub-math'] }, // Needs Eng & Math
  ];

  console.log('Generating routine for 2 classes, 3 teachers, 5 slots...');

  // 2. Run Algorithm
  const routine = await service.generateRoutine(slots, teachers, classes);

  // 3. Output Results
  console.log(`Generated ${routine.length} entries.`);
  console.log(JSON.stringify(routine, null, 2));

  // 4. Verification Logic
  // Ensure all class subjects are covered (simplified check)
  const c1Entries = routine.filter(r => r.classId === 'c1');
  const c2Entries = routine.filter(r => r.classId === 'c2');

  console.log(`Class 10A has ${c1Entries.length} entries.`);
  console.log(`Class 10B has ${c2Entries.length} entries.`);

  if (c1Entries.length > 0 && c2Entries.length > 0) {
      console.log('PASS: Routine generated successfully with content.');
  } else {
      console.error('FAIL: Routine generation failed to cover subjects.');
      process.exit(1);
  }
}

runVerification();
