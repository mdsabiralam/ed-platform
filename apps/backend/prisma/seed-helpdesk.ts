import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Ticket Categories...');

  const categories = [
    { name: 'Transport', description: 'Issues related to school transport' },
    { name: 'Academic', description: 'Academic inquiries and issues' },
    { name: 'Accounts', description: 'Fee and payment related issues' },
    { name: 'General', description: 'General inquiries' },
  ];

  for (const category of categories) {
    await prisma.ticketCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('Ticket Categories seeded successfully.');
}

if (require.main === module) {
    main()
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
      });
}

export { main as seedTicketCategories };
