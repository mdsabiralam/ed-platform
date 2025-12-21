import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying tables in the database (2.J.01)...');

  try {
    // PostgreSQL query to list all tables in the public schema
    const result: Array<{ table_name: string }> = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    if (result.length === 0) {
      console.warn('⚠️  No tables found in the public schema.');
    } else {
      console.log(`✅ Successfully connected. Found ${result.length} tables:`);
      result.forEach(row => console.log(` - ${row.table_name}`));
    }

  } catch (error) {
    console.error('❌ Error connecting to database or fetching tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();