import { Test, TestingModule } from '@nestjs/testing';
import { PdfGeneratorService } from './pdf-generator.service';
import { SAMPLE_MARKSHEET_LAYOUT } from '../interfaces/marksheet-layout.interface';
import { PDFDocument } from 'pdf-lib';

describe('Task 6.F.10: PDF Page Sizing Verification', () => {
  let service: PdfGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfGeneratorService],
    }).compile();

    service = module.get<PdfGeneratorService>(PdfGeneratorService);
  });

  it('should generate A4 PDF with dimensions 595x842', async () => {
    // 1. Create template (mocked by layout) with A4
    // 2. Generate PDF
    const pdfBytes = await service.generatePdf(SAMPLE_MARKSHEET_LAYOUT, {}, { pageSize: 'A4' });

    // 3. Verify metadata
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    console.log(`A4 Dimensions: ${width} x ${height}`);

    // Expected: 595.28 x 841.89
    expect(Math.round(width)).toBe(595);
    expect(Math.round(height)).toBe(842);
  });

  it('should generate Letter PDF with dimensions 612x792', async () => {
    // 1. Create template (mocked by layout) with Letter
    // 2. Generate PDF
    const pdfBytes = await service.generatePdf(SAMPLE_MARKSHEET_LAYOUT, {}, { pageSize: 'LETTER' });

    // 3. Verify metadata
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    console.log(`Letter Dimensions: ${width} x ${height}`);

    // Expected: 612 x 792
    expect(Math.round(width)).toBe(612);
    expect(Math.round(height)).toBe(792);
  });
});
