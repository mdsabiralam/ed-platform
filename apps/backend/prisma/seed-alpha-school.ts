import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Alpha School (Pilot Launch)...');

  // 1. Create Tenant
  const tenantName = 'Alpha School';
  let tenant = await prisma.tenant.findFirst({
    where: { name: tenantName },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        subdomain: 'alpha-school', // Required and unique
        subscriptionStatus: 'ACTIVE',
        isActive: true,
      },
    });
    console.log(`Created Tenant: ${tenant.name} (${tenant.id})`);
  } else {
    console.log(`Tenant ${tenant.name} already exists.`);
  }

  // 2. Onboard 50 Staff Members
  const passwordHash = await bcrypt.hash('Welcome@123', 10);

  // Create Principal
  const principalEmail = 'principal@alphaschool.com';
  const existingPrincipal = await prisma.user.findUnique({ where: { email: principalEmail } });

  if (!existingPrincipal) {
    await prisma.user.create({
      data: {
        email: principalEmail,
        passwordHash: passwordHash, // Fixed: password -> passwordHash
        phone: '9876543210',
        profiles: {
          create: {
            role: 'PRINCIPAL',
            tenantId: tenant.id,
          }
        },
        staffProfile: {
          create: {
            tenantId: tenant.id,
            designation: 'Principal',
            department: 'Administration',
            joiningDate: new Date(),
          },
        },
      },
    });
    console.log('Created Principal user.');
  }

  // Create Teachers
  const departments = ['Science', 'Mathematics', 'Humanities', 'Sports', 'Administration'];

  for (let i = 1; i <= 49; i++) {
    const email = `staff${i}@alphaschool.com`;
    const exists = await prisma.user.findUnique({ where: { email } });

    if (!exists) {
      const deptName = departments[i % departments.length]; // Distribute across depts
      await prisma.user.create({
        data: {
          email,
          passwordHash: passwordHash,
          phone: `90000000${i.toString().padStart(2, '0')}`,
          profiles: {
            create: {
              role: 'TEACHER',
              tenantId: tenant.id,
            }
          },
          staffProfile: {
            create: {
              tenantId: tenant.id,
              designation: 'Teacher',
              department: deptName,
              joiningDate: new Date(),
            },
          },
        },
      });
    }
  }
  console.log('Onboarded 50 Staff members.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
