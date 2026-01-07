import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';
import { OpenAI } from 'openai';
import { QueryDto } from './dto/query.dto';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY') || 'dummy-key',
    });
  }

  async processQuery(dto: QueryDto) {
    const { studentId, question, subjectId } = dto;

    // 1. Caching (Prompt 8)
    const cacheKey = `rag:${subjectId}:${question.trim().toLowerCase()}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
        this.logger.log(`Cache hit for question: ${question}`);
        return cached;
    }

    // 2. Generate Embedding (Prompt 4)
    const questionEmbedding = await this.embeddingService.generateEmbedding(question);

    // 3. Retrieval (Prompt 5)
    // Cosine similarity <=> operator in pgvector
    const vectorString = `[${questionEmbedding.join(',')}]`;

    const results = await this.prisma.$queryRaw`
      SELECT id, content_chunk, page_number, 1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM textbook_embeddings
      WHERE book_id = ${subjectId}
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT 3;
    ` as any[];

    if (!results || results.length === 0) {
        return { answer: "I couldn't find relevant information in the textbook.", sources: [] };
    }

    const context = results.map(r => r.content_chunk).join('\n\n');
    const sources = results.map(r => ({ page: r.page_number, chapter: 'Unknown' })); // Chapter not in DB schema yet

    // 4. Generation (Prompt 6)
    const prompt = `You are a helpful tutor. Answer the question based ONLY on the following context:

    ${context}

    Question: ${question}`;

    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    });

    const answer = completion.choices[0].message.content || 'No response from AI';

    // 5. Logging (Prompt 9)
    await this.logInteraction(studentId, question, answer, 0); // feedback 0 initially

    // 6. Response with Citations (Prompt 7)
    const response = {
      answer,
      sources,
    };

    // Save to Cache (24 hours TTL)
    await this.cacheManager.set(cacheKey, response, 24 * 60 * 60 * 1000);

    return response;
  }

  private async logInteraction(studentId: string, question: string, answer: string, feedback: number) {
    try {
        await this.prisma.studentActivityLog.create({
            data: {
                studentId,
                question,
                aiResponse: answer,
                feedback
            }
        });
    } catch (e) {
        this.logger.error('Failed to log interaction', e);
    }
  }
}
