import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiDoubtService {
  constructor(private prisma: PrismaService) {}

  async generateEmbedding(text: string): Promise<number[]> {
    // Mock embedding generation (1536 dimensions)
    // In a real scenario, call OpenAI API or similar
    return Array.from({ length: 1536 }, () => Math.random());
  }

  async solveDoubt(studentId: string, subjectId: string, question: string) {
    const vector = await this.generateEmbedding(question);
    const vectorString = `[${vector.join(',')}]`;

    // Perform similarity search using cosine distance (<=> operator)
    // Select top 3 relevant chunks as requested
    const results: any[] = await this.prisma.$queryRaw`
      SELECT content_chunk
      FROM textbook_embeddings
      WHERE subject_id = ${subjectId}
      ORDER BY vector <=> ${vectorString}::vector
      LIMIT 3;
    `;

    // Map results to extracting content_chunk
    const context = results.map((r) => r.content_chunk);

    return {
      Context: context,
    };
  }
}
