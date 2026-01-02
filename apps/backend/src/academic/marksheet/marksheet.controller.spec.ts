import { Test, TestingModule } from '@nestjs/testing';
import { MarksheetController } from './marksheet.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

describe('MarksheetController', () => {
  let controller: MarksheetController;
  let prismaService: PrismaService;

  const mockPrismaService = {
    studentFeeLedger: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarksheetController],
      providers: [
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<MarksheetController>(MarksheetController);
    prismaService = module.get<PrismaService>(PrismaService);
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

    await expect(controller.getMarksheetPdf(studentId)).rejects.toThrow(ForbiddenException);
    await expect(controller.getMarksheetPdf(studentId)).rejects.toThrow('Please clear outstanding dues to view result');
  });

  it('should return success if student has NO dues', async () => {
    const studentId = 'student-clear';

    // Mock finding NO record with dues
    (mockPrismaService.studentFeeLedger.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await controller.getMarksheetPdf(studentId);
    expect(result).toEqual({ message: 'Marksheet PDF generated successfully', studentId });
  });
});
