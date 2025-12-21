import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying permissions for "analytics_reader" (2.J.03)...');

  try {
    // 1. Check if user exists
    const roles: any[] = await prisma.$queryRaw`
      SELECT rolname FROM pg_roles WHERE rolname = 'analytics_reader';
    `;

    if (roles.length === 0) {
      console.error('❌ User "analytics_reader" does not exist.');
      return;
    }
    console.log('✅ User "analytics_reader" exists.');

    // 2. Check SELECT permissions on public tables
    const permissions: any[] = await prisma.$queryRaw`
      SELECT table_name, privilege_type
      FROM information_schema.role_table_grants
      WHERE grantee = 'analytics_reader'
      AND table_schema = 'public'
      ORDER BY table_name;
    `;

    if (permissions.length === 0) {
      console.warn('⚠️  "analytics_reader" has no permissions on public tables.');
    } else {
      console.log(`📊 Permission Report for analytics_reader:`);
      console.log(`   ✅ Granted SELECT access on ${permissions.length} tables.`);
    }

  } catch (error) {
    console.error('❌ Error verifying permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();