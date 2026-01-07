import { PrismaClient, RelationshipType, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting verification...');

  const phone = '+1999999999'; // Unique phone for test

  // Clean up previous runs
  const existingUserToDelete = await prisma.user.findFirst({ where: { phone } });
  if (existingUserToDelete) {
      console.log('Cleaning up previous user...');
      // Delete mappings first
      const guardian = await prisma.guardian.findUnique({ where: { userId: existingUserToDelete.id } });
      if (guardian) {
          await prisma.parentStudentMapping.deleteMany({ where: { guardianId: guardian.id } });
          await prisma.guardian.delete({ where: { id: guardian.id } });
      }
      await prisma.user.delete({ where: { id: existingUserToDelete.id } });
  }

  // Need a tenant.
  const tenant = await prisma.tenant.create({
      data: {
          name: 'Test Tenant',
          subdomain: `test-${Date.now()}`,
          subscriptionStatus: 'ACTIVE'
      }
  });

  const session = await prisma.admissionSession.create({
      data: {
          tenantId: tenant.id,
          name: '2024',
          startDate: new Date(),
          endDate: new Date(),
      }
  });

  const classObj = await prisma.class.create({
      data: { tenantId: tenant.id, name: 'Class 1' }
  });

  const section = await prisma.section.create({
      data: { classId: classObj.id, name: 'A' }
  });

  // Create Student 1
  const student1 = await prisma.student.create({
      data: {
          tenantId: tenant.id,
          admissionSessionId: session.id,
          sectionId: section.id,
          firstName: 'Student',
          lastName: 'One',
          admissionNo: `A1-${Date.now()}`
      }
  });

  console.log('Created Student 1: ' + student1.id);

  // --- Sibling Logic Simulation Round 1 (New Guardian) ---
  let guardianId: string;
  let existingUser = await prisma.user.findFirst({ where: { phone }, include: { guardian: true } });

  if (existingUser) {
      // Logic for existing user
      if (existingUser.guardian) {
          guardianId = existingUser.guardian.id;
      } else {
           const g = await prisma.guardian.create({
              data: { userId: existingUser.id, fullName: 'Father Test', relationship: 'Father' }
           });
           guardianId = g.id;
      }
  } else {
      // Create user and guardian
      console.log('Creating new User and Guardian for Student 1...');
      const u = await prisma.user.create({
          data: {
              phone: phone,
              email: `test-${Date.now()}@example.com`,
              passwordHash: 'hash',
              guardian: {
                  create: { fullName: 'Father Test', relationship: 'Father', occupation: 'Engineer', annualIncome: 100000 }
              },
              profiles: {
                  create: { role: UserRole.PARENT, tenantId: tenant.id }
              }
          },
          include: { guardian: true }
      });
      guardianId = u.guardian!.id;
  }

  // Link Student 1
  await prisma.parentStudentMapping.create({
      data: { studentId: student1.id, guardianId, relationshipType: RelationshipType.FATHER, isPrimaryContact: true }
  });

  console.log('Student 1 linked to Guardian ' + guardianId);

  // --- Create Student 2 ---
  const student2 = await prisma.student.create({
      data: {
          tenantId: tenant.id,
          admissionSessionId: session.id,
          sectionId: section.id,
          firstName: 'Student',
          lastName: 'Two',
          admissionNo: `A2-${Date.now()}`
      }
  });
  console.log('Created Student 2: ' + student2.id);

  // --- Sibling Logic Simulation Round 2 (Existing Guardian) ---
  existingUser = await prisma.user.findFirst({ where: { phone }, include: { guardian: true } });

  let guardianId2: string;
  if (existingUser) {
      console.log('User found for phone ' + phone);
      if (existingUser.guardian) {
          console.log('Existing guardian found: ' + existingUser.guardian.id);
          guardianId2 = existingUser.guardian.id;
      } else {
           const g = await prisma.guardian.create({
              data: { userId: existingUser.id, fullName: 'Father Test', relationship: 'Father' }
           });
           guardianId2 = g.id;
      }
  } else {
      console.log('User NOT found (Unexpected)');
      const u = await prisma.user.create({
          data: {
              phone: phone,
               email: `test2-${Date.now()}@example.com`,
              passwordHash: 'hash',
              guardian: {
                  create: { fullName: 'Father Test', relationship: 'Father' }
              }
          },
          include: { guardian: true }
      });
      guardianId2 = u.guardian!.id;
  }

  // Link Student 2
  await prisma.parentStudentMapping.create({
      data: { studentId: student2.id, guardianId: guardianId2, relationshipType: RelationshipType.FATHER, isPrimaryContact: false }
  });

  console.log('Student 2 linked to Guardian ' + guardianId2);

  // --- Verification ---
  if (guardianId !== guardianId2) {
      console.error('FAILED: Guardian IDs do not match!');
      process.exit(1);
  }

  const guardianCount = await prisma.guardian.count({
      where: { user: { phone: phone } }
  });

  console.log(`Guardian count for phone ${phone}: ${guardianCount}`);

  if (guardianCount === 1) {
      console.log('SUCCESS: Sibling logic verified. Only 1 Guardian record exists.');
  } else {
      console.error(`FAILED: Expected 1 Guardian, found ${guardianCount}`);
      process.exit(1);
  }

  const mappings = await prisma.parentStudentMapping.findMany({
      where: { guardianId: guardianId }
  });
  console.log(`Mapping count: ${mappings.length}`);

  if (mappings.length === 2) {
      console.log('SUCCESS: Guardian has 2 students linked.');
  } else {
       console.error(`FAILED: Expected 2 mappings, found ${mappings.length}`);
  }

  await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
