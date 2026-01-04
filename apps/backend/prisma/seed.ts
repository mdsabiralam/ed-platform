import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function cleanUp() {
  console.log('Cleaning up database...');
  // Delete in reverse order of dependencies to avoid foreign key constraints
  await prisma.rolePermission.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.parentStudentMapping.deleteMany({});
  await prisma.guardian.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.staffProfile.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.platformAdmin.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenantSubscription.deleteMany({});
  await prisma.plan.deleteMany({});
  await prisma.tenant.deleteMany({});
  console.log('Database cleanup completed.');
}

async function seedPermissions() {
  console.log('Seeding permissions...');

  // Define permissions
  const permissions = [
    { action: 'can_mark_attendance', description: 'Allows marking student attendance' },
    { action: 'can_view_own_schedule', description: 'Allows viewing own class schedule' },
    { action: 'can_collect_fees', description: 'Allows collecting student fees' },
  ];

  // Create Permission records
  for (const perm of permissions) {
    await prisma.permission.create({
      data: perm,
    });
  }

  // Define Role Mappings
  const roleMappings = [
    {
      role: UserRole.TEACHER,
      actions: ['can_mark_attendance', 'can_view_own_schedule'],
    },
    {
      role: UserRole.STAFF, // Mapping ACCOUNTANT use case to STAFF role
      actions: ['can_collect_fees'],
    },
  ];

  // Create RolePermission records
  for (const mapping of roleMappings) {
    for (const action of mapping.actions) {
      const permission = await prisma.permission.findUnique({
        where: { action },
      });

      if (permission) {
        await prisma.rolePermission.create({
          data: {
            role: mapping.role,
            permissionId: permission.id,
          },
        });
      }
    }
  }
  console.log('Permissions and Role Mappings seeded.');
}

async function main() {
  // 1. Clean up existing data
  await cleanUp();

  // 2. Seed Permissions
  await seedPermissions();

  console.log('Seeding database...');

  // 2.B.09 Seed Plans
  const plans = [
    { name: 'Silver', priceMonthly: 2000, featuresConfig: { students: 100, storage: '5GB' } },
    { name: 'Gold', priceMonthly: 5000, featuresConfig: { students: 500, storage: '20GB' } },
    { name: 'Platinum', priceMonthly: 10000, featuresConfig: { students: 'Unlimited', storage: '100GB' } },
    { name: 'PLATFORM_OWNER', priceMonthly: 0, featuresConfig: { students: 'Unlimited', storage: 'Unlimited' } }, // High Tier
  ];

  for (const plan of plans) {
    await prisma.plan.create({
      data: {
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        featuresConfig: plan.featuresConfig,
      },
    });
  }
  console.log('Plans seeded.');

  // 2.H.04: Super Admin Institute Seed
  // 1. Create 'EduMatrix HQ' Institute
  const platformOwnerPlan = await prisma.plan.findUniqueOrThrow({ where: { name: 'PLATFORM_OWNER' } });

  const eduMatrixHQ = await prisma.tenant.create({
    data: {
      name: 'EduMatrix HQ',
      subdomain: 'admin',
      subscriptionStatus: 'ACTIVE',
      subscription: {
        create: {
          planId: platformOwnerPlan.id,
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 100)), // 100 years
          autoRenew: true,
        },
      },
    },
  });
  console.log(`Institute 'EduMatrix HQ' created with ID: ${eduMatrixHQ.id}`);

  // 4. Create 'Super Admin' User linked to this institute
  const saltRounds = 10;
  const password = await bcrypt.hash('securePassword123', saltRounds); // Hashed password

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@edumatrix.com', // Using a specific email for the super admin
      passwordHash: password,
      phone: '+8801700000000',
      profiles: {
        create: {
          tenantId: eduMatrixHQ.id,
          role: UserRole.SUPER_ADMIN,
        },
      },
      platformAdmin: {
        create: {
          role: 'SUPER_ADMIN',
        },
      },
    },
    include: {
      profiles: true,
      platformAdmin: true,
    },
  });

  console.log('Super Admin user created:', {
    email: superAdmin.email,
    tenant: eduMatrixHQ.name,
    role: superAdmin.profiles[0].role,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
