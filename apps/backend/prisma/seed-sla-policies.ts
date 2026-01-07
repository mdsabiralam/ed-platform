import { PrismaClient, TicketPriority } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedSlaPolicies() {
  console.log('Seeding SLA Policies...');

  // Ensure default category exists
  let generalCategory = await prisma.ticketCategory.findUnique({
    where: { name: 'General' },
  });

  if (!generalCategory) {
    generalCategory = await prisma.ticketCategory.create({
      data: { name: 'General' },
    });
  }

  const policies = [
    { priority: TicketPriority.URGENT, maxResolutionTimeHours: 4 },
    { priority: TicketPriority.HIGH, maxResolutionTimeHours: 24 },
    { priority: TicketPriority.MEDIUM, maxResolutionTimeHours: 48 },
    { priority: TicketPriority.LOW, maxResolutionTimeHours: 72 },
  ];

  for (const policy of policies) {
    await prisma.slaPolicy.upsert({
      where: {
        ticketCategoryId_priority: {
          ticketCategoryId: generalCategory.id,
          priority: policy.priority,
        },
      },
      update: {
        maxResolutionTimeHours: policy.maxResolutionTimeHours,
      },
      create: {
        ticketCategoryId: generalCategory.id,
        priority: policy.priority,
        maxResolutionTimeHours: policy.maxResolutionTimeHours,
      },
    });
  }

  console.log('SLA Policies seeded.');
}
