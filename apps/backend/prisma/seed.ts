import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_PERMISSIONS = {
  [Role.INSTITUTE_ADMIN]: ['manage_users', 'manage_fees', 'view_reports'],
  [Role.TEACHER]: ['view_students', 'manage_marks', 'view_routine'],
};

async function main() {
  console.log('Seeding database...');

  // 3.E.08 Seed Default Permissions
  console.log('Seeding default permissions...');
  for (const [role, actions] of Object.entries(DEFAULT_PERMISSIONS)) {
    const typedRole = role as Role;
    for (const action of actions) {
      // Create permission if not exists
      const permission = await prisma.permission.upsert({
        where: { action },
        update: {},
        create: { action },
      });

      // Assign permission to role
      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: {
            role: typedRole,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          role: typedRole,
          permissionId: permission.id,
        },
      });
    }
  }
  console.log('Default permissions seeded.');

  // 2.B.09 Seed Plans
  const plans = [
    { name: 'Silver', priceMonthly: 2000, featuresConfig: { students: 100, storage: '5GB' } },
    { name: 'Gold', priceMonthly: 5000, featuresConfig: { students: 500, storage: '20GB' } },
    { name: 'Platinum', priceMonthly: 10000, featuresConfig: { students: 'Unlimited', storage: '100GB' } },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: {
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        featuresConfig: plan.featuresConfig,
      },
    });
  }
  console.log('Plans seeded.');

  // ১. পাসওয়ার্ড হ্যাশ করা (নিরাপত্তার জন্য)
  const saltRounds = 10;
  const password = await bcrypt.hash('SuperSecretPassword123!', saltRounds);

  // 2.C.10 Create Super Admin User
  // Note: In real scenario, Super Admin might not need a profile linked to a tenant immediately, 
  // or linked to a default "Admin Tenant". For now, creating just the User.
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@edplatform.com' },
    update: {}, // ইউজার ইতিমধ্যে থাকলে কিছু আপডেট করার দরকার নেই
    create: {
      email: 'admin@edplatform.com',
      passwordHash: password,
      phone: '+8801700000000',
    },
  });

  console.log({ superAdmin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });