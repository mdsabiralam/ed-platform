import * as fs from 'fs';
const pdf = require('pdf-parse');
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock Embedding API
async function mockGenerateEmbedding(text: string): Promise<number[]> {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 50));
  // Return a random vector of dimension 1536
  return Array.from({ length: 1536 }, () => Math.random());
}

async function ingestTextbook(filePath: string, subjectId: string, chapterId: string) {
  console.log(`Starting ingestion for ${filePath}...`);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const dataBuffer = fs.readFileSync(filePath);

  try {
    const data = await pdf(dataBuffer);
    const fullText = data.text;
    console.log(`Extracted ${fullText.length} characters.`);

    // Split into chunks of 1000 characters
    const chunkSize = 1000;
    const chunks: string[] = [];

    // Simple chunking strategy (can be improved to respect sentences/paragraphs)
    for (let i = 0; i < fullText.length; i += chunkSize) {
      chunks.push(fullText.substring(i, i + chunkSize));
    }

    console.log(`Created ${chunks.length} chunks.`);

    let processedCount = 0;

    for (const [index, chunk] of chunks.entries()) {
      const embedding = await mockGenerateEmbedding(chunk);

      // Format vector as string for PostgreSQL vector type: "[1.0, 2.0, ...]"
      const vectorString = `[${embedding.join(',')}]`;

      // Page number approximation (pdf-parse provides info.numpages, but mapping chunks to pages strictly is hard without per-page extraction.
      // For this script, we'll just use a placeholder or derived index if available,
      // but pdf-parse standard output gives full text.
      // We will assign pageNumber = 1 for simplicity or try to parse paginated if needed.
      // However, pdf-parse documentation says it returns text.
      // Let's assume 1 for now or iterate if we had per-page data.)
      const pageNumber = 1;

      await prisma.$executeRaw`
        INSERT INTO "textbook_embeddings" ("id", "subject_id", "chapter_id", "content_chunk", "page_number", "vector")
        VALUES (gen_random_uuid(), ${subjectId}, ${chapterId}, ${chunk}, ${pageNumber}, ${vectorString}::vector)
      `;

      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`Processed ${processedCount}/${chunks.length} chunks...`);
      }
    }

    console.log(`Successfully ingested ${processedCount} chunks into TextbookEmbedding.`);

  } catch (error) {
    console.error('Error processing PDF:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// CLI usage
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: npx ts-node scripts/ingest-textbook.ts <pdf-file-path> <subject-id> <chapter-id>');
} else {
  const [filePath, subjectId, chapterId] = args;
  ingestTextbook(filePath, subjectId, chapterId);
}
