import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private embeddings: OpenAIEmbeddings;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not found. Embeddings will fail if called.');
    }
    this.embeddings = new OpenAIEmbeddings({
      apiKey: apiKey || 'dummy-key', // Prevent crash on init, fail on call
      modelName: 'text-embedding-ada-002',
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // sanitize text
      const sanitized = text.replace(/\n/g, ' ');
      return await this.embeddings.embedQuery(sanitized);
    } catch (error) {
      this.logger.error('Error generating embedding', error);
      throw error;
    }
  }
}
