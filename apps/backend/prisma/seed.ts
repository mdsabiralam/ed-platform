import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log('Seeding database...');
  // ডিফল্ট প্ল্যান তৈরি (যদি না থাকে)
  const platinumPlan = await prisma.plan.upsert({
    where: { name: 'Platinum' },
    update: {},
    create: {
      name: 'Platinum',
      price: 5000,
      features: ['All Features', 'Unlimited Students'],
    },
  });
  console.log('Seeding finished:', platinumPlan);
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.\();
  });
