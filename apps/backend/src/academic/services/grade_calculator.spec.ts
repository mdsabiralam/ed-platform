import { Test, TestingModule } from '@nestjs/testing';
import { ResultService } from './result.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('GradeCalculator (ResultService)', () => {
  let service: ResultService;

  const mockScale = [
      { label: 'A1', minScore: 91, maxScore: 100 },
      { label: 'A2', minScore: 81, maxScore: 90.99 }, // Adjusted for float test case
      { label: 'B1', minScore: 71, maxScore: 80.99 },
  ];

  const mockPrisma = {
    examTerm: { findMany: jest.fn() },
    resultSummary: { findUnique: jest.fn() }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResultService,
        { provide: PrismaService, useValue: mockPrisma }
      ],
    }).compile();

    service = module.get<ResultService>(ResultService);
  });

  it('should return A1 for 91', () => {
      expect(service.calculateGrade(91, mockScale)).toBe('A1');
  });

  it('should return A2 for 90.9', () => {
      expect(service.calculateGrade(90.9, mockScale)).toBe('A2');
  });

  it('should throw error for 101', () => {
      expect(() => service.calculateGrade(101, mockScale)).toThrow('Invalid Score');
  });
});
