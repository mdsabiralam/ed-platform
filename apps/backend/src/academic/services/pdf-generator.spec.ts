import { Test, TestingModule } from '@nestjs/testing';
import { PdfGeneratorService } from './pdf-generator.service';
import { SAMPLE_MARKSHEET_LAYOUT } from '../interfaces/marksheet-layout.interface';
import { PDFDocument } from 'pdf-lib';

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfGeneratorService],
    }).compile();

    service = module.get<PdfGeneratorService>(PdfGeneratorService);
  });

  it('should generate A4 PDF by default', async () => {
    const pdfBytes = await service.generatePdf(SAMPLE_MARKSHEET_LAYOUT, {});
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
    // A4 is 595.28 x 841.89
    expect(Math.round(width)).toBe(595);
    expect(Math.round(height)).toBe(842);
  });

  it('should generate Letter PDF if requested', async () => {
    const pdfBytes = await service.generatePdf(SAMPLE_MARKSHEET_LAYOUT, {}, { pageSize: 'LETTER' });
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
    // Letter is 612 x 792
    expect(Math.round(width)).toBe(612);
    expect(Math.round(height)).toBe(792);
  });
});
