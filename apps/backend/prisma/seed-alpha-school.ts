import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Alpha School for Pilot Launch...');

  // 1. Create Tenant
  const alphaSchool = await prisma.tenant.upsert({
    where: { subdomain: 'alpha' },
    update: {},
    create: {
      name: 'Alpha School',
      subdomain: 'alpha',
      subscriptionStatus: 'ACTIVE',
    },
  });

  console.log(`Created Tenant: ${alphaSchool.name} (${alphaSchool.id})`);

  // 2. Create Principal
  const principalPassword = await bcrypt.hash('Alpha@2024', 10);
  const principalUser = await prisma.user.create({
    data: {
      email: 'principal@alpha.school',
      passwordHash: principalPassword,
      phone: '+919876543210',
      profiles: {
        create: {
          tenantId: alphaSchool.id,
          role: 'PRINCIPAL',
        },
      },
    },
  });
  console.log('Created Principal: principal@alpha.school');

  // 3. Create 50 Staff Members
  const password = await bcrypt.hash('Welcome@123', 10); // Default password

  for (let i = 1; i <= 50; i++) {
    const email = `staff${i}@alpha.school`;
    const user = await prisma.user.create({
      data: {
        email: email,
        passwordHash: password,
        phone: `+9190000000${i.toString().padStart(2, '0')}`,
        profiles: {
            create: {
                tenantId: alphaSchool.id,
                role: 'TEACHER',
            }
        }
      },
    });

    await prisma.staffProfile.create({
        data: {
            userId: user.id,
            tenantId: alphaSchool.id,
            designation: 'Assistant Teacher',
            joiningDate: new Date(),
        }
    });
  }

  console.log('✅ Onboarded 50 Staff members successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
