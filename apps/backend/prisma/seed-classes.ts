import { PrismaClient } from '@prisma/client';

export const STANDARD_CLASSES = [
  'Nursery',
  'LKG',
  'UKG',
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
  for (const name of STANDARD_CLASSES) {
    const existing = await prisma.class.findFirst({
      where: { tenantId, name },
    });

    if (!existing) {
      await prisma.class.create({
        data: {
          tenantId,
          name,
          seatCapacity: 40,
        },
      });
    }
  }
}
