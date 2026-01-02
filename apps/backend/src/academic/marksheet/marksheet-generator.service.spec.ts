import { Test, TestingModule } from '@nestjs/testing';
import { MarksheetGeneratorService } from './marksheet-generator.service';
import { Readable } from 'stream';

describe('MarksheetGeneratorService', () => {
  let service: MarksheetGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarksheetGeneratorService],
    }).compile();

    service = module.get<MarksheetGeneratorService>(MarksheetGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a PDF stream', async () => {
    const stream = await service.generatePdf('student-123');
    expect(stream).toBeInstanceOf(Readable);

    // Read stream content to verify it starts with PDF signature
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);
    const pdfSignature = pdfBuffer.toString('utf-8', 0, 4);
    expect(pdfSignature).toBe('%PDF');
  });
});
