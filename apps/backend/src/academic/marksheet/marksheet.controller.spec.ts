import { Test, TestingModule } from '@nestjs/testing';
import { MarksheetController } from './marksheet.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfGeneratorService } from '../services/pdf-generator.service';
import { ForbiddenException, StreamableFile } from '@nestjs/common';
import { Response } from 'express';

describe('MarksheetController', () => {
  let controller: MarksheetController;
  let prismaService: PrismaService;
  let pdfService: PdfGeneratorService;

  const mockPrismaService = {
    studentFeeLedger: {
      findFirst: jest.fn(),
    },
  };

  const mockPdfService = {
    generateMarksheet: jest.fn().mockResolvedValue(Buffer.from('dummy-pdf')),
  };

  const mockResponse = {
    set: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarksheetController],
      providers: [
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PdfGeneratorService, useValue: mockPdfService },
      ],
    }).compile();

    controller = module.get<MarksheetController>(MarksheetController);
    prismaService = module.get<PrismaService>(PrismaService);
    pdfService = module.get<PdfGeneratorService>(PdfGeneratorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw ForbiddenException if student has outstanding dues', async () => {
    const studentId = 'student-with-dues';

    // Mock finding a record with dues
    (mockPrismaService.studentFeeLedger.findFirst as jest.Mock).mockResolvedValue({
      id: 'ledger-1',
      studentId,
      amountDue: 5000,
      status: 'PENDING',
    });

    await expect(controller.getMarksheetPdf(studentId, mockResponse)).rejects.toThrow(ForbiddenException);
    await expect(controller.getMarksheetPdf(studentId, mockResponse)).rejects.toThrow('Please clear outstanding dues to view result');
  });

  it('should return PDF stream if student has NO dues', async () => {
    const studentId = 'student-clear';

    // Mock finding NO record with dues
    (mockPrismaService.studentFeeLedger.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await controller.getMarksheetPdf(studentId, mockResponse);

    expect(pdfService.generateMarksheet).toHaveBeenCalledWith({ studentId });
    expect(mockResponse.set).toHaveBeenCalledWith(expect.objectContaining({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="marksheet-${studentId}.pdf"`,
    }));
    expect(result).toBeInstanceOf(StreamableFile);
  });
});
