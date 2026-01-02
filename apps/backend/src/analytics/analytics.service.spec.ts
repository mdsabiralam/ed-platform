import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            student: {
              findMany: jest.fn(),
            },
            studentMark: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSectionToppers', () => {
    it('should return top 3 students with ranks', async () => {
      const sectionId = 'sec-1';
      const examTermId = 'term-1';

      const mockStudents = [
        {
          id: 's1',
          firstName: 'A',
          lastName: 'Student',
          admissionNo: '001',
          marks: [
            { theoryMarks: 90, practicalMarks: 10, exam: { maxTheory: 100, maxPractical: 10 } }, // Total 100
          ],
        },
        {
          id: 's2',
          firstName: 'B',
          lastName: 'Student',
          admissionNo: '002',
          marks: [
            { theoryMarks: 80, practicalMarks: 10, exam: { maxTheory: 100, maxPractical: 10 } }, // Total 90
          ],
        },
        {
          id: 's3',
          firstName: 'C',
          lastName: 'Student',
          admissionNo: '003',
          marks: [
            { theoryMarks: 70, practicalMarks: 10, exam: { maxTheory: 100, maxPractical: 10 } }, // Total 80
          ],
        },
        {
          id: 's4',
          firstName: 'D',
          lastName: 'Student',
          admissionNo: '004',
          marks: [
            { theoryMarks: 60, practicalMarks: 10, exam: { maxTheory: 100, maxPractical: 10 } }, // Total 70
          ],
        },
      ];

      (prisma.student.findMany as jest.Mock).mockResolvedValue(mockStudents);

      const result = await service.getSectionToppers(sectionId, examTermId);

      expect(result).toHaveLength(3);
      expect(result[0].rank).toBe(1);
      expect(result[0].studentId).toBe('s1');
      expect(result[1].rank).toBe(2);
      expect(result[1].studentId).toBe('s2');
      expect(result[2].rank).toBe(3);
      expect(result[2].studentId).toBe('s3');
    });

    it('should handle ties correctly (1, 1, 3)', async () => {
       const sectionId = 'sec-1';
       const examTermId = 'term-1';

       const mockStudents = [
         {
           id: 's1',
           firstName: 'A',
           lastName: 'Student',
           admissionNo: '001',
           marks: [{ theoryMarks: 90, practicalMarks: 10, exam: { maxTheory: 100 } }], // 100
         },
         {
           id: 's2',
           firstName: 'B',
           lastName: 'Student',
           admissionNo: '002',
           marks: [{ theoryMarks: 90, practicalMarks: 10, exam: { maxTheory: 100 } }], // 100
         },
         {
           id: 's3',
           firstName: 'C',
           lastName: 'Student',
           admissionNo: '003',
           marks: [{ theoryMarks: 80, practicalMarks: 10, exam: { maxTheory: 100 } }], // 90
         },
       ];

       (prisma.student.findMany as jest.Mock).mockResolvedValue(mockStudents);

       const result = await service.getSectionToppers(sectionId, examTermId);

       expect(result).toHaveLength(3);
       // Check Rank 1 Tie
       expect(result[0].rank).toBe(1);
       expect(result[1].rank).toBe(1);
       expect(result[2].rank).toBe(3); // Rank 3 because 1, 2 are taken (or 1,1,3 in competition rank)
    });

    it('should return empty array if no students', async () => {
        (prisma.student.findMany as jest.Mock).mockResolvedValue([]);
        const result = await service.getSectionToppers('s1', 't1');
        expect(result).toEqual([]);
    });
  });

  describe('getStudentProgress', () => {
    it('should calculate progress for multiple terms sorted chronologically', async () => {
      const studentId = 's1';
      const mockMarks = [
        {
          theoryMarks: 40, practicalMarks: 10,
          exam: {
            maxTheory: 50, maxPractical: 10,
            examTermId: 'term-2',
            examTerm: { name: '2024 Half', startDate: new Date('2024-06-01') },
          },
        },
        {
          theoryMarks: 35, practicalMarks: 5,
          exam: {
            maxTheory: 50, maxPractical: 10,
            examTermId: 'term-1',
            examTerm: { name: '2023 Final', startDate: new Date('2023-12-01') },
          },
        },
      ];

      (prisma.studentMark.findMany as jest.Mock).mockResolvedValue(mockMarks);

      const result = await service.getStudentProgress(studentId);

      expect(result).toHaveLength(2);

      // Chronological order: 2023 Final (Dec 2023) -> 2024 Half (June 2024)
      expect(result[0].term).toBe('2023 Final');
      // 40/60 = 66.67%
      expect(result[0].percent).toBeCloseTo(66.67, 1);

      expect(result[1].term).toBe('2024 Half');
      // 50/60 = 83.33%
      expect(result[1].percent).toBeCloseTo(83.33, 1);
    });

    it('should limit results to last 6 terms', async () => {
       const studentId = 's1';
       const mockMarks = [];
       // Create 7 terms
       for (let i = 0; i < 7; i++) {
         mockMarks.push({
           theoryMarks: 50, practicalMarks: 0,
           exam: {
             maxTheory: 100, maxPractical: 0,
             examTermId: `term-${i}`,
             examTerm: { name: `Term ${i}`, startDate: new Date(2020 + i, 0, 1) },
           },
         });
       }

       (prisma.studentMark.findMany as jest.Mock).mockResolvedValue(mockMarks);

       const result = await service.getStudentProgress(studentId);

       expect(result).toHaveLength(6);
       // Should start from Term 1 (2021) to Term 6 (2026), skipping Term 0 (2020)
       expect(result[0].term).toBe('Term 1');
       expect(result[5].term).toBe('Term 6');
    });
  });
});
