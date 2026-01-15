import { Test, TestingModule } from '@nestjs/testing';
import { PrincipalService } from './principal.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PrincipalService', () => {
  let service: PrincipalService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrincipalService,
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

    service = module.get<PrincipalService>(PrincipalService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate class performance correctly', async () => {
    const classId = 'class-1';
    const examTermId = 'term-1';

    const mockStudents = [
      {
        id: 's1',
        marks: [
          {
            theoryMarks: 40,
            practicalMarks: 10,
            exam: {
              maxTheory: 50,
              maxPractical: 10,
              subjectId: 'math',
              subject: { name: 'Math' },
            },
          },
        ],
      },
      {
        id: 's2',
        marks: [
          {
            theoryMarks: 45,
            practicalMarks: 10,
            exam: {
              maxTheory: 50,
              maxPractical: 10,
              subjectId: 'math',
              subject: { name: 'Math' },
            },
          },
        ],
      },
    ];

    (prisma.student.findMany as jest.Mock).mockResolvedValue(mockStudents);

    const result = await service.getClassPerformance(classId, examTermId);

    // s1: 50/60 = 83.33%
    // s2: 55/60 = 91.66%
    // Class Average: (83.33 + 91.66) / 2 = 87.5
    // Highest: 91.66
    // Lowest: 83.33
    // Subject Math: (83.33 + 91.66) / 2 = 87.5

    expect(result.class_average).toBeCloseTo(87.5, 1);
    expect(result.highest_score).toBeCloseTo(91.67, 1);
    expect(result.lowest_score).toBeCloseTo(83.33, 1);
    expect(result.subject_wise_averages[0].subject).toBe('Math');
    expect(result.subject_wise_averages[0].average).toBeCloseTo(87.5, 1);
  });

  it('should return zeros if no students found', async () => {
    (prisma.student.findMany as jest.Mock).mockResolvedValue([]);
    const result = await service.getClassPerformance('c1', 't1');
    expect(result.class_average).toBe(0);
  });

  describe('getWeakStudents', () => {
    it('should identify students with > 2 failed subjects', async () => {
      const classId = 'class-1';
      const examTermId = 'term-1';

      const mockStudents = [
        {
          id: 'weak-student',
          firstName: 'John',
          lastName: 'Doe',
          admissionNo: 'A123',
          marks: [
            // Fail 1 (10/100 = 10%)
            {
              theoryMarks: 10,
              practicalMarks: 0,
              exam: { maxTheory: 100, maxPractical: 0, subject: { name: 'Math' } },
            },
            // Fail 2 (20/100 = 20%)
            {
              theoryMarks: 20,
              practicalMarks: 0,
              exam: { maxTheory: 100, maxPractical: 0, subject: { name: 'Science' } },
            },
            // Fail 3 (30/100 = 30%)
            {
              theoryMarks: 30,
              practicalMarks: 0,
              exam: { maxTheory: 100, maxPractical: 0, subject: { name: 'English' } },
            },
          ],
        },
        {
          id: 'strong-student',
          firstName: 'Jane',
          lastName: 'Doe',
          admissionNo: 'A124',
          marks: [
            // Pass
            {
              theoryMarks: 90,
              practicalMarks: 0,
              exam: { maxTheory: 100, maxPractical: 0, subject: { name: 'Math' } },
            },
          ],
        },
      ];

      (prisma.student.findMany as jest.Mock).mockResolvedValue(mockStudents);

      const result = await service.getWeakStudents(classId, examTermId, 33);

      expect(result).toHaveLength(1);
      expect(result[0].studentId).toBe('weak-student');
      expect(result[0].failedSubjectsCount).toBe(3);
      expect(result[0].failedSubjects).toHaveLength(3);
    });

    it('should return empty list if no students fail more than 2 subjects', async () => {
      const classId = 'class-1';
      const examTermId = 'term-1';

      const mockStudents = [
        {
            id: 'borderline-student',
            firstName: 'Bob',
            lastName: 'Smith',
            admissionNo: 'B123',
            marks: [
                // Fail 1
                { theoryMarks: 10, practicalMarks: 0, exam: { maxTheory: 100, maxPractical: 0, subject: { name: 'Math' } } },
                // Fail 2
                { theoryMarks: 10, practicalMarks: 0, exam: { maxTheory: 100, maxPractical: 0, subject: { name: 'Science' } } },
                // Pass
                { theoryMarks: 40, practicalMarks: 0, exam: { maxTheory: 100, maxPractical: 0, subject: { name: 'English' } } },
            ]
        }
      ];

       (prisma.student.findMany as jest.Mock).mockResolvedValue(mockStudents);

       const result = await service.getWeakStudents(classId, examTermId, 33);
       expect(result).toHaveLength(0);
    });
  });
});
