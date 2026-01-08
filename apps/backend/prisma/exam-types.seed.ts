import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const examTypes = [
    { name: 'Theory', description: 'Standard written theory exam' },
    { name: 'Practical', description: 'Hands-on practical assessment' },
    { name: 'Viva', description: 'Oral examination or interview' },
    { name: 'Project', description: 'Project-based evaluation' },
    { name: 'Assignment', description: 'Coursework or assignment submission' },
  ];

  console.log('Seeding Exam Types...');

  for (const type of examTypes) {
    await prisma.examType.upsert({
      where: { name: type.name },
      update: {},
      create: {
        name: type.name,
        description: type.description,
      },
    });
  }
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });