import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
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
    // Select top 5 relevant chunks
    const results = await this.prisma.$queryRaw`
      SELECT id, content_chunk, page_number, 1 - (vector <=> ${vectorString}::vector) as similarity
      FROM textbook_embeddings
      WHERE subject_id = ${subjectId}
      ORDER BY vector <=> ${vectorString}::vector
      LIMIT 5;
    `;

    return {
      question,
      relatedContext: results,
    };
  }
}
