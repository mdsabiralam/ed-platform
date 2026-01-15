import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying RLS Policies...');

  try {
    // 2.J.02 Check RLS Status
    // Note: Since we are using Prisma/Postgres directly, checking RLS involves querying pg_class and pg_policy
    const rlsCheck = await prisma.$queryRaw`
      SELECT tablename, rowsecurity
      FROM pg_tables
      JOIN pg_class ON pg_tables.tablename = pg_class.relname
      WHERE schemaname = 'public' AND rowsecurity = true;
    `;

    console.log('✅ RLS Enabled Tables:', rlsCheck);
    console.log('💡 Note: For Supabase, ensure RLS is enabled on sensitive tables (Users, Institutes, etc.)');

  } catch (error) {
    console.error('❌ RLS Verification Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
