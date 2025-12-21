import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('⏱️  Checking Database Latency (2.J.04)...');

  try {
    const start = Date.now();
    
    // Execute a simple query
    await prisma.$queryRaw`SELECT 1`;
    
    const end = Date.now();
    const latency = end - start;

    console.log(`✅ Database responded in ${latency}ms`);

    if (latency > 100) {
      console.warn('⚠️  High latency detected! (> 100ms)');
    } else {
      console.log('🚀 Latency is within acceptable limits.');
    }

  } catch (error) {
    console.error('❌ Error checking latency:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();