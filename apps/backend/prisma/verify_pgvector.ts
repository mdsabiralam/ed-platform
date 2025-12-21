import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying pgvector extension for embeddings...');

  try {
    // Check installed extensions
    const extensions: any[] = await prisma.$queryRaw`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname = 'vector';
    `;

    if (extensions.length > 0) {
      console.log(`✅ 'vector' extension is installed (Version: ${extensions[0].extversion}).`);
      
      // Test vector operations
      try {
        // Try a simple vector operation to ensure it works
        await prisma.$queryRaw`SELECT ('[1,2,3]'::vector + '[4,5,6]'::vector)::text`;
        console.log('✅ Vector operations are functioning correctly.');
      } catch (opError) {
        console.warn('⚠️  Extension installed but vector operations failed:', opError);
      }

    } else {
      console.warn('❌ "vector" extension is NOT installed.');
      console.log('💡 Run this SQL to install it: CREATE EXTENSION IF NOT EXISTS vector;');
    }

  } catch (error) {
    console.error('❌ Error checking pgvector:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();