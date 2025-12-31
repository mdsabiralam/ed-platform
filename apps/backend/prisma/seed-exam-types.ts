import { PrismaClient } from '@prisma/client';

export async function seedExamTypes(prisma: PrismaClient) {
  console.log('Seeding Exam Types...');
  const types = [
    { name: 'Theory', description: 'Written examination' },
    { name: 'Practical', description: 'Lab or hands-on assessment' },
    { name: 'Viva', description: 'Oral examination' },
    { name: 'Project', description: 'Project work assessment' },
    { name: 'Assignment', description: 'Home or class assignment' },
  ];

  for (const t of types) {
    await prisma.examType.upsert({
      where: { name: t.name },
      update: {},
      create: t,
    });
  }
  console.log('Exam Types seeded.');
}
