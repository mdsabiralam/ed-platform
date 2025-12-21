import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🛡️  Starting SQL Injection Vulnerability Test (2.I.09)...');

  // Test Payload: A classic SQL injection string that attempts to bypass logic
  // If vulnerable, '1'='1' would make the condition true for all rows.
  const maliciousPayload = "' OR '1'='1";
  console.log(`🧪 Testing with malicious payload: "${maliciousPayload}"`);

  try {
    // Attempt to inject into a search query (e.g., searching for a User by email)
    // Prisma uses parameterized queries, so this should be treated as a literal string.
    const results = await prisma.user.findMany({
      where: {
        email: {
          contains: maliciousPayload, 
        },
      },
    });

    console.log(`📊 Query executed. Records found: ${results.length}`);

    if (results.length > 0) {
      console.warn('⚠️  WARNING: Records were returned. Unless you have a user with this exact email, check for injection.');
    } else {
      console.log('✅ SUCCESS: No records found. The payload was safely escaped as a string literal.');
      console.log('🔒 Prisma ORM is correctly preventing SQL Injection on standard inputs.');
    }

  } catch (error) {
    console.error('❌ Error executing query:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();