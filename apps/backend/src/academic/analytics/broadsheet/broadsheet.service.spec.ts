import { Test, TestingModule } from '@nestjs/testing';
import { BroadsheetService } from './broadsheet.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

describe('BroadsheetService', () => {
  let service: BroadsheetService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BroadsheetService,
        {
          provide: PrismaService,
          useValue: {
            student: {
              findMany: jest.fn(),
            },
            exam: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BroadsheetService>(BroadsheetService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a broadsheet workbook with correct data', async () => {
    const classId = 'c1';
    const examTermId = 't1';

    // Mock Exams (Subjects)
    const mockExams = [
      { id: 'e1', subject: { name: 'Math' } },
      { id: 'e2', subject: { name: 'English' } },
    ];

    // Mock Students with Marks
    const mockStudents = [
      {
        id: 's1',
        rollNo: 1,
        firstName: 'John',
        lastName: 'Doe',
        marks: [
          {
            theoryMarks: 40,
            practicalMarks: 10, // 50
            exam: { maxTheory: 50, maxPractical: 10, subject: { name: 'Math' } },
          },
          {
            theoryMarks: 40,
            practicalMarks: 10, // 50
            exam: { maxTheory: 50, maxPractical: 10, subject: { name: 'English' } },
          },
        ],
      },
      {
        id: 's2',
        rollNo: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        marks: [
          {
            theoryMarks: 30,
            practicalMarks: 10, // 40
            exam: { maxTheory: 50, maxPractical: 10, subject: { name: 'Math' } },
          },
          // Missed English
        ],
      },
    ];

    (prisma.exam.findMany as jest.Mock).mockResolvedValue(mockExams);
    (prisma.student.findMany as jest.Mock).mockResolvedValue(mockStudents);

    const workbook = await service.generateBroadsheet(classId, examTermId);

    expect(workbook).toBeInstanceOf(ExcelJS.Workbook);
    const worksheet = workbook.getWorksheet('Broadsheet');
    expect(worksheet).toBeDefined();

    // Check Headers
    const headerRow = worksheet.getRow(1);
    // [Roll No, Name, Math, English, Total, %, Rank]
    expect(headerRow.getCell(1).value).toBe('Roll No');
    expect(headerRow.getCell(3).value).toBe('Math');
    expect(headerRow.getCell(4).value).toBe('English');
    expect(headerRow.getCell(7).value).toBe('Rank');

    // Check Data Row 1 (John Doe) - Total 100, Rank 1
    const row2 = worksheet.getRow(2);
    expect(row2.getCell(1).value).toBe(1); // Roll No
    expect(row2.getCell(2).value).toBe('John Doe');
    expect(row2.getCell(3).value).toBe(50); // Math
    expect(row2.getCell(4).value).toBe(50); // English
    expect(row2.getCell(5).value).toBe(100); // Total
    // (100 / 120) * 100 = 83.33
    expect(row2.getCell(6).value).toBeCloseTo(83.33, 1);
    expect(row2.getCell(7).value).toBe(1); // Rank 1

    // Check Data Row 2 (Jane Smith) - Total 40, Rank 2
    // Row 3 because sorting by Roll No
    const row3 = worksheet.getRow(3);
    expect(row3.getCell(1).value).toBe(2);
    expect(row3.getCell(3).value).toBe(40); // Math
    expect(row3.getCell(4).value).toBe('-'); // Missing English
    expect(row3.getCell(5).value).toBe(40); // Total
    expect(row3.getCell(7).value).toBe(2); // Rank 2
  });
});
