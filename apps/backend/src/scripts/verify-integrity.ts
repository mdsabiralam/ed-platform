import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyIntegrity() {
  console.log('Starting Database Integrity Check...');

  // 4.J.02 Verify valid section_id (and implied class_id via section)
  const students = await prisma.student.findMany({
    include: { section: true }
  });

  const invalidStudents = students.filter(s => !s.sectionId || !s.section);

  if (invalidStudents.length > 0) {
    console.error(`Found ${invalidStudents.length} students with invalid section/class linkage:`, invalidStudents.map(s => s.id));
    process.exit(1);
  }

  console.log(`Verified ${students.length} students. All have valid section assignments.`);
  process.exit(0);
}

verifyIntegrity().catch(e => {
  console.error(e);
  process.exit(1);
});
