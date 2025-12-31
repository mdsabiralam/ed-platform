// 6.B.10: Unit Test for Grade Calculation
import { Test, TestingModule } from '@nestjs/testing';
import { ResultService } from './result.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ResultService - Grade Calculation', () => {
  let service: ResultService;
  let prisma: PrismaService;

  const mockGradingLogic = [
    { minScore: 91, maxScore: 100, label: 'A1' },
    { minScore: 81, maxScore: 90, label: 'A2' },
    { minScore: 0, maxScore: 32, label: 'E' },
  ];

  const mockPrisma = {
    gradingLogic: {
      findMany: jest.fn().mockResolvedValue(mockGradingLogic),
    },
    subjectGradingMap: { findUnique: jest.fn() },
    gradingScale: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResultService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ResultService>(ResultService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return A1 for score 91', async () => {
    const grade = await service.calculateGrade(91, 'scale-1');
    expect(grade).toBe('A1');
  });

  it('should return A1 for score 95', async () => {
    const grade = await service.calculateGrade(95, 'scale-1');
    expect(grade).toBe('A1');
  });

  it('should return A2 for score 90', async () => {
    const grade = await service.calculateGrade(90, 'scale-1');
    expect(grade).toBe('A2');
  });

  it('should return E for score 32', async () => {
    const grade = await service.calculateGrade(32, 'scale-1');
    expect(grade).toBe('E');
  });

  it('should throw error for invalid score 101', async () => {
    await expect(service.calculateGrade(101, 'scale-1')).rejects.toThrow('Invalid Score');
  });
});
