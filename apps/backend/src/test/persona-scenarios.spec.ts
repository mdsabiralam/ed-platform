import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../ai/ai.service';
import { MarksheetService } from '../academic/marksheet/marksheet.service';
import { HomeworkService } from '../academic/homework/homework.service';
import { PrismaService } from '../prisma/prisma.service';

// --- Mock Data Setup ---

// 1. Rahul (Student)
const mockRahul = {
  id: 'rahul-123',
  firstName: 'Rahul',
  lastName: 'Roy',
  badgeCount: 0, // Starts with 0
  marks: [
    { subject: 'Math', score: 95, total: 100, term: 'Term 1' },
    { subject: 'Physics', score: 88, total: 100, term: 'Term 1' }
  ]
};

// 2. Textbook Content (Physics)
const mockTextbookPhysics = {
  id: 'tb-physics',
  content: "Ohm's Law states that the current through a conductor between two points is directly proportional to the voltage across the two points.",
  pageNumber: 102
};

// 3. Homework (Math Assignment) - Due in the future (On Time)
const mockMathHomework = {
  id: 'hw-math',
  studentId: 'rahul-123',
  title: 'Math Assignment: Algebra',
  status: 'PENDING',
  dueDate: new Date(Date.now() + 86400000 * 2) // Due in 2 days
};

// --- Mock Prisma Service ---
const mockPrismaService = {
  textbookEmbedding: {
    findFirst: jest.fn().mockImplementation((args) => {
      const keyword = args?.where?.content?.contains;
      if (keyword && (mockTextbookPhysics.content.includes(keyword) || keyword === "Ohm's Law" || keyword.includes("Ohm"))) {
        return Promise.resolve(mockTextbookPhysics);
      }
      return Promise.resolve(null);
    }),
  },
  student: {
    findUnique: jest.fn().mockResolvedValue(mockRahul),
    update: jest.fn().mockImplementation((args) => {
      if (args.data.badgeCount?.increment) {
        mockRahul.badgeCount += args.data.badgeCount.increment;
      }
      return Promise.resolve(mockRahul);
    }),
  },
  homework: {
    findUnique: jest.fn().mockResolvedValue(mockMathHomework),
    update: jest.fn().mockResolvedValue({ ...mockMathHomework, status: 'SUBMITTED', submittedAt: new Date() }),
  },
};

describe('Persona Scenarios: Rahul & Mrs. Roy', () => {
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

  describe('Act as Rahul (Class 10 Student)', () => {
    it('1. AI Help: Ask "What is Ohm\'s Law?"', async () => {
      console.log('\n--- Rahul Scenario 1: AI Help ---');
      const question = "What is Ohm's Law?";
      const result = await aiService.solveDoubt(question);

      console.log(`Rahul asks: "${question}"`);
      console.log(`AI answers: "${result.answer}" (Source: ${result.citation})`);

      expect(result.answer).toContain("Ohm's Law states");
      expect(result.citation).toBe("Page 102");
    });

    it('2. Earn a Badge: Submit Math Assignment', async () => {
      console.log('\n--- Rahul Scenario 2: Earn a Badge ---');
      const initialBadges = mockRahul.badgeCount;
      console.log(`Rahul's Badge Count before submission: ${initialBadges}`);

      await homeworkService.submitHomework('hw-math');

      console.log('Rahul submits Math Assignment...');
      console.log(`Rahul's Badge Count after submission: ${mockRahul.badgeCount}`);

      expect(mockRahul.badgeCount).toBe(initialBadges + 1);
      // Simulate "Feeling Happy" feedback
      console.log('Feedback: "Yes! I earned a Homework Hero badge! I feel motivated!"');
    });

    it('3. Result: Download "Term 1 Report Card"', async () => {
      console.log('\n--- Rahul Scenario 3: Result Viewer ---');
      const pdfBuffer = await marksheetService.generatePdf('rahul-123');

      console.log('Rahul downloads Term 1 Report Card...');
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      console.log('PDF downloaded successfully.');
    });
  });

  describe('Act as Mrs. Roy (Parent)', () => {
    it('1. Check Result: Find Rahul\'s Marksheet', async () => {
      console.log('\n--- Mrs. Roy Scenario 1: Check Result ---');
      const pdfBuffer = await marksheetService.generatePdf('rahul-123');

      console.log('Mrs. Roy opens the app and downloads Rahul\'s Report Card...');
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      // Logic check: Parent can access student data via the same service method (RBAC handled in controller/guard, service is data access)
      console.log('Mrs. Roy successfully views the report card.');
    });

    it('2. Gamification Visibility: See "Homework Hero" badge', async () => {
      console.log('\n--- Mrs. Roy Scenario 2: Gamification Visibility ---');
      // Simulate viewing profile by fetching student data
      const studentProfile = await mockPrismaService.student.findUnique({ where: { id: 'rahul-123' } });

      console.log(`Mrs. Roy views Rahul's profile.`);
      console.log(`Visible Badge Count: ${studentProfile.badgeCount}`);

      expect(studentProfile.badgeCount).toBeGreaterThan(0);
      console.log('Feedback: "I can see he earned a badge. I feel informed about his progress."');
    });
  });
});
