import { Controller, Get, Param, Query, Res, UseGuards, Inject } from '@nestjs/common';
import * as express from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ResultAccessGuard } from '../../common/guards/result-access.guard';
import { MarksheetGeneratorService } from './marksheet-generator.service';
import { StorageService } from '../../common/services/storage.service';
import { Readable } from 'stream';
import axios from 'axios';

@Controller('api/academic/marksheet')
export class MarksheetController {
  constructor(
    private readonly marksheetGeneratorService: MarksheetGeneratorService,
    private readonly storageService: StorageService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('pdf/:id')
  @UseGuards(ResultAccessGuard)
  async getMarksheetPdf(
    @Param('id') id: string,
    @Query('examId') examId: string,
    @Res() res: express.Response,
  ) {
    // Default examId if not provided (mock behavior)
    const effectiveExamId = examId || 'default-exam';
    const cacheKey = `marksheet_pdf:${id}:${effectiveExamId}`;

    const cachedUrl = await this.cacheManager.get<string>(cacheKey);

    if (cachedUrl) {
      console.log(`Cache Hit: ${cachedUrl}`);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="marksheet.pdf"',
      });

      if (cachedUrl.includes('mock-storage.com')) {
        // Mock environment: Stream dummy content to verify cache was used
        const mockStream = new Readable();
        mockStream.push('Served from Cache: ' + cachedUrl);
        mockStream.push(null);
        mockStream.pipe(res);
        return;
      } else {
        // Real scenario: Fetch from S3/Supabase and stream
        try {
          const response = await axios.get(cachedUrl, { responseType: 'stream' });
          response.data.pipe(res);
          return;
        } catch (error) {
          console.error('Failed to fetch cached PDF, regenerating...', error);
          // Fallback to regeneration if fetch fails
        }
      }
    }

    // Generate
    const stream = await this.marksheetGeneratorService.generatePdf(id);

    // We need to convert stream to buffer to upload?
    // MarksheetGeneratorService returns Readable.
    // We need buffer for upload (StorageService mock takes Buffer).
    // Stream is consumed if we read it.
    // So we should modify MarksheetGeneratorService to return Buffer OR read stream here.

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // Upload
    const fileName = `marksheet-${id}-${effectiveExamId}.pdf`;
    const url = await this.storageService.uploadFile(`temp/${fileName}`, buffer);

    // Cache
    await this.cacheManager.set(cacheKey, url, 24 * 60 * 60 * 1000); // 24h

    // Return
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="marksheet.pdf"',
    });

    // Create stream from buffer again since original stream is consumed
    const responseStream = new Readable();
    responseStream.push(buffer);
    responseStream.push(null);
    responseStream.pipe(res);
  }
}
