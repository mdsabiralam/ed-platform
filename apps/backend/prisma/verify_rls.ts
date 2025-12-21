import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying RLS (Row Level Security) policies (2.J.02)...');

  try {
    // PostgreSQL query to fetch tables, RLS status, and policies
    const results: any[] = await prisma.$queryRaw`
      SELECT
        c.relname::text AS table_name,
        c.relrowsecurity AS rls_enabled,
        p.polname::text AS policy_name,
        CASE
          WHEN p.polcmd = 'r' THEN 'SELECT'
          WHEN p.polcmd = 'a' THEN 'INSERT'
          WHEN p.polcmd = 'w' THEN 'UPDATE'
          WHEN p.polcmd = 'd' THEN 'DELETE'
          WHEN p.polcmd = '*' THEN 'ALL'
          ELSE p.polcmd::text
        END AS command
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_policy p ON p.polrelid = c.oid
      WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      ORDER BY c.relname, p.polname;
    `;

    if (results.length === 0) {
      console.warn('⚠️  No tables found in public schema.');
    } else {
      console.log(`📊 RLS Status Report:`);
      console.log('---------------------------------------------------');
      
      let currentTable = '';
      
      results.forEach(row => {
        if (currentTable !== row.table_name) {
            if (currentTable !== '') console.log(''); // Newline between tables
            console.log(`📦 Table: ${row.table_name}`);
            console.log(`   🔒 RLS Enabled: ${row.rls_enabled ? '✅ YES' : '❌ NO'}`);
            currentTable = row.table_name;
        }
        
        if (row.policy_name) {
            console.log(`      - Policy: ${row.policy_name} (${row.command})`);
        } else if (row.rls_enabled) {
            console.log(`      ⚠️  RLS enabled but NO policies defined (Default: Deny All)`);
        }
      });
      
      console.log('\n---------------------------------------------------');
      console.log('💡 Note: For Supabase, ensure RLS is enabled on sensitive tables (Users, Tenants, etc.)');
    }

  } catch (error) {
    console.error('❌ Error fetching RLS info:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();