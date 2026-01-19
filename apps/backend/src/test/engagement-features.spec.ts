import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../ai/ai.service';
import { MarksheetService } from '../academic/marksheet/marksheet.service';
import { HomeworkService } from '../academic/homework/homework.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock Data
const mockStudent = {
  id: 'student-1',
  firstName: 'John',
  lastName: 'Doe',
  badgeCount: 0,
  marks: [
    { subject: 'Physics', score: 85, total: 100, term: 'Final Term' },
    { subject: 'Math', score: 90, total: 100, term: 'Final Term' }
  ]
};

const mockTextbook = {
  id: 'tb-1',
  content: "Newton's Third Law states that for every action, there is an equal and opposite reaction.",
  pageNumber: 42
};

const mockHomeworkOnTime = {
  id: 'hw-1',
  studentId: 'student-1',
  title: 'Physics Assignment',
  status: 'PENDING',
  dueDate: new Date(Date.now() + 86400000) // Tomorrow
};

const mockHomeworkLate = {
  id: 'hw-2',
  studentId: 'student-1',
  title: 'Math Assignment',
  status: 'PENDING',
  dueDate: new Date(Date.now() - 86400000) // Yesterday
};

const mockPrismaService = {
  textbookEmbedding: {
    findFirst: jest.fn().mockImplementation((args) => {
        // Simple mock of the 'contains' logic
        const keyword = args?.where?.content?.contains;
        if (keyword && mockTextbook.content.includes(keyword)) {
            return Promise.resolve(mockTextbook);
        }
        return Promise.resolve(null);
    }),
  },
  student: {
    findUnique: jest.fn().mockResolvedValue(mockStudent),
    update: jest.fn(),
  },
  homework: {
    findUnique: jest.fn().mockImplementation((args) => {
        if (args.where.id === 'hw-1') return Promise.resolve(mockHomeworkOnTime);
        if (args.where.id === 'hw-2') return Promise.resolve(mockHomeworkLate);
        return Promise.resolve(null);
    }),
    update: jest.fn().mockResolvedValue({ status: 'SUBMITTED' }),
  },
};

describe('Engagement Features Test (Simulating Student Actions)', () => {
  let aiService: AiService;
  let marksheetService: MarksheetService;
  let homeworkService: HomeworkService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        MarksheetService,
        HomeworkService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    aiService = module.get<AiService>(AiService);
    marksheetService = module.get<MarksheetService>(MarksheetService);
    homeworkService = module.get<HomeworkService>(HomeworkService);
  });

  // 1. AI Doubt Solver Test
  it('Task 104: AI Doubt Solver should explain Newton\'s Third Law with citation', async () => {
    const result = await aiService.solveDoubt("Explain Newton's Third Law");

    expect(result.answer).toContain("Newton's Third Law states");
    expect(result.citation).toBe("Page 42");
    console.log('✅ AI Doubt Solver Test Passed:', result);
  });

  // 2. Result Viewer Test
  it('Task 136: Result Viewer should generate a PDF for Final Term', async () => {
    const pdfBuffer = await marksheetService.generatePdf('student-1');

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    // Simple check if PDF header exists
    const pdfHeader = pdfBuffer.slice(0, 4).toString();
    expect(pdfHeader).toBe('%PDF');
    console.log('✅ Result Viewer Test Passed: PDF Generated');
  });

  // 3. Gamification Test (On Time)
  it('Task 86: Gamification should increment badge count on homework submission (On Time)', async () => {
    await homeworkService.submitHomework('hw-1');

    expect(mockPrismaService.homework.update).toHaveBeenCalledWith({
      where: { id: 'hw-1' },
      data: { status: 'SUBMITTED', submittedAt: expect.any(Date) },
    });

    expect(mockPrismaService.student.update).toHaveBeenCalledWith({
      where: { id: 'student-1' },
      data: { badgeCount: { increment: 1 } },
    });
    console.log('✅ Gamification Test Passed: Badge Incremented');
  });

  // 4. Gamification Test (Late)
  it('Task 86: Gamification should NOT increment badge count on late homework submission', async () => {
    mockPrismaService.student.update.mockClear();
    await homeworkService.submitHomework('hw-2');

    expect(mockPrismaService.homework.update).toHaveBeenCalledWith({
      where: { id: 'hw-2' },
      data: { status: 'SUBMITTED', submittedAt: expect.any(Date) },
    });

    expect(mockPrismaService.student.update).not.toHaveBeenCalled();
    console.log('✅ Gamification Test Passed: Badge NOT Incremented (Late)');
  });
});
