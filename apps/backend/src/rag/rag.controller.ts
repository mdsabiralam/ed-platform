import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { RagService } from './rag.service';
import { IngestionService } from './ingestion.service';
import { QueryDto, IngestDto } from './dto/query.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('RAG (Doubt Solver)')
@Controller('nlp')
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly ingestionService: IngestionService,
  ) {}

  @Post('query')
  @ApiOperation({ summary: 'Ask a question to the AI tutor' })
  async query(@Body(new ValidationPipe()) queryDto: QueryDto) {
    return await this.ragService.processQuery(queryDto);
  }

  // Admin endpoint to trigger ingestion (Not explicitly requested as public API but needed for testing/admin)
  @Post('ingest')
  @ApiOperation({ summary: 'Ingest a PDF textbook' })
  async ingest(@Body() ingestDto: IngestDto) {
      await this.ingestionService.ingestTextbook(ingestDto.subjectId, ingestDto.filePath);
      return { message: 'Ingestion started' };
  }
}
