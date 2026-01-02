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
});
