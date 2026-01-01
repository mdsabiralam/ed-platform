import { Test, TestingModule } from '@nestjs/testing';
import { ResultService } from './result.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ResultService', () => {
  let service: ResultService;

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

  describe('checkPassCriteria', () => {
    it('should return true if theory and practical are >= 33%', () => {
      // 33/100, 33/100
      expect(service.checkPassCriteria(33, 33, 100, 100)).toBe(true);
    });

    it('should return false if theory < 33%', () => {
      // 32/100, 40/100
      expect(service.checkPassCriteria(32, 40, 100, 100)).toBe(false);
    });

    it('should return false if practical < 33%', () => {
      // 40/100, 32/100
      expect(service.checkPassCriteria(40, 32, 100, 100)).toBe(false);
    });

    it('should handle no practical component', () => {
      // 33/100, no practical
      expect(service.checkPassCriteria(33, null, 100, null)).toBe(true);
      expect(service.checkPassCriteria(32, null, 100, 0)).toBe(false);
    });
  });

  describe('calculateCGPA', () => {
    it('should return average and Passed status', () => {
      // 8, 9, 10 -> 27/3 = 9.0
      const res = service.calculateCGPA([8, 9, 10]);
      expect(res.cgpa).toBe(9.0);
      expect(res.status).toBe('Passed');
    });

    it('should return Needs Improvement if any subject is 0', () => {
      // 8, 9, 0 -> 17/3 = 5.666... -> 5.67
      const res = service.calculateCGPA([8, 9, 0]);
      expect(res.cgpa).toBe(5.67);
      expect(res.status).toBe('Needs Improvement');
    });
  });

  describe('applyGraceMarks', () => {
    it('should apply grace marks if deficit <= 5 and total grace <= 5', () => {
      const results = [
        { subjectId: '1', score: 30, passMark: 33 }, // deficit 3
        { subjectId: '2', score: 32, passMark: 33 }, // deficit 1
      ];
      // Total deficit 4. Should apply to both.
      const out = service.applyGraceMarks(results, 5);
      expect(out.graceUsed).toBe(4);
      expect(out.results[0].score).toBe(33);
      expect(out.results[0].isGraceApplied).toBe(true);
      expect(out.results[1].score).toBe(33);
      expect(out.results[1].isGraceApplied).toBe(true);
    });

    it('should stop applying if limit reached', () => {
      const results = [
        { subjectId: '1', score: 30, passMark: 33 }, // deficit 3
        { subjectId: '2', score: 30, passMark: 33 }, // deficit 3
      ];
      // Total deficit 6. Max 5.
      // Should apply to first (uses 3). Remaining 2.
      // Second needs 3. 3 > 2. Should NOT apply.
      const out = service.applyGraceMarks(results, 5);
      expect(out.graceUsed).toBe(3);
      expect(out.results[0].isGraceApplied).toBe(true);
      expect(out.results[1].isGraceApplied).toBe(false);
      expect(out.results[1].score).toBe(30);
    });

    it('should not apply if deficit > 5', () => {
        const results = [
            { subjectId: '1', score: 20, passMark: 33 }, // deficit 13
        ];
        const out = service.applyGraceMarks(results, 5);
        expect(out.graceUsed).toBe(0);
        expect(out.results[0].isGraceApplied).toBe(false);
    });
  });

  describe('calculateBestOfFive', () => {
    it('should calculate best of 5 correctly', () => {
      // 6 subjects: 90, 80, 70, 60, 50, 40
      // Top 5: 90, 80, 70, 60, 50. Sum = 350.
      // Max 500. Percentage 70.
      const res = service.calculateBestOfFive([40, 90, 60, 80, 50, 70]);
      expect(res.totalMarks).toBe(350);
      expect(res.percentage).toBe(70);
      expect(res.subjectsConsidered).toBe(5);
    });

    it('should handle fewer than 5 subjects', () => {
      // 3 subjects: 90, 80, 70. Sum 240. Max 300. Percentage 80.
      const res = service.calculateBestOfFive([90, 80, 70]);
      expect(res.totalMarks).toBe(240);
      expect(res.percentage).toBe(80);
      expect(res.subjectsConsidered).toBe(3);
    });
  });

  describe('determinePromotionStatus', () => {
      it('should return PASS for 0 fails', () => {
          expect(service.determinePromotionStatus(0)).toBe('PASS');
      });
      it('should return COMPARTMENT for 1 or 2 fails', () => {
          expect(service.determinePromotionStatus(1)).toBe('COMPARTMENT');
          expect(service.determinePromotionStatus(2)).toBe('COMPARTMENT');
      });
      it('should return FAIL for > 2 fails', () => {
          expect(service.determinePromotionStatus(3)).toBe('FAIL');
      });
  });

  describe('calculatePercentage', () => {
      it('should calculate and round to 2 decimal places', () => {
          expect(service.calculatePercentage(455, 600)).toBe(75.83);
      });
      it('should handle zero total', () => {
          expect(service.calculatePercentage(100, 0)).toBe(0);
      });
  });
});
