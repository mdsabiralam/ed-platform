import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async solveDoubt(question: string) {
    // Optimized for memory safety: fetch only relevant records using database filtering
    // In a real production environment with pgvector, this would use vector similarity search:
    // ORDER BY vector <-> embedding LIMIT 1

    // Simple keyword extraction (naive approach for prototype)
    // We take the last meaningful word or the whole question as a fallback for 'contains'
    // In reality, we'd use Full Text Search or Vectors
    const keyword = question.replace(/Explain|What|is|the/gi, '').trim();

    if (!keyword) {
        return { answer: "Please ask a specific question.", citation: null };
    }

    const bestMatch = await this.prisma.textbookEmbedding.findFirst({
      where: {
        content: { contains: keyword, mode: 'insensitive' }
      }
    });

    if (!bestMatch) {
        return { answer: "I couldn't find an answer in the textbook.", citation: null };
    }

    return {
      answer: bestMatch.content,
      citation: `Page ${bestMatch.pageNumber}`
    };
  }
}
