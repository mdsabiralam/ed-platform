import { PrismaClient } from '@prisma/client';

export const STANDARD_CLASSES = [
  'Nursery',
  'KG',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
];

export async function seedClasses(prisma: PrismaClient, tenantId: string) {
  console.log(`Seeding classes for tenant ${tenantId}...`);

  for (const className of STANDARD_CLASSES) {
    // Check if class exists by name for this tenant to avoid duplicates (assuming name is unique per tenant conceptually, though schema doesn't enforce unique name per tenant in db strictly unless we add it, but upsert needs unique)
    // Schema: Class has id (PK). No unique constraint on [tenantId, name].
    // So we use findFirst + create, or just create if not exists.

    const existing = await prisma.class.findFirst({
      where: {
        tenantId,
        name: className,
      },
    });

    if (!existing) {
      await prisma.class.create({
        data: {
          tenantId,
          name: className,
          seatCapacity: 40, // Default capacity
        },
      });
    }
  }

  console.log(`Classes seeded for tenant ${tenantId}.`);
}
