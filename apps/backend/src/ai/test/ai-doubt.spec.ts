import { Test, TestingModule } from '@nestjs/testing';
import { AiDoubtService } from '../ai-doubt.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AiDoubtService (Integration)', () => {
  let service: AiDoubtService;
  let prisma: PrismaService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
    aiInteraction: {
      create: jest.fn().mockResolvedValue({ id: 'mock-interaction-id' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiDoubtService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AiDoubtService>(AiDoubtService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should retrieve relevant context and return an answer with citation', async () => {
    // 1. Mock Vector Search Response
    const mockChunks = [
      {
        content_chunk: "Newton's First Law states that an object will remain at rest or in uniform motion in a straight line unless acted upon by an external force.",
        page_number: 42,
      },
      {
        content_chunk: "Newton's Second Law relates force, mass, and acceleration.",
        page_number: 43,
      },
      {
        content_chunk: "Gravity is a force that attracts two bodies toward each other.",
        page_number: 45,
      },
    ];

    // Mock $queryRaw to return the mock chunks
    (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockChunks);

    // 2. Call solveDoubt
    const question = "What is Newton's First Law?";
    const studentId = "student-123";
    const subjectId = "physics-101";

    const result = await service.solveDoubt(studentId, subjectId, question);

    // 3. Verify Response
    expect(prisma.$queryRaw).toHaveBeenCalled();

    // Verify context contains the mock text
    expect(result.context).toBeDefined();
    expect(result.context[0]).toContain("Newton's First Law states");

    // Verify citation page number (should be from the first/most relevant chunk)
    expect(result.sourcePage).toBe(42);

    // Verify an answer is returned
    expect(result.answer).toBeDefined();
    expect(result.answer).toContain("This is a simulated AI answer");

    // Verify interaction logging
    expect(result.interactionId).toBe('mock-interaction-id');
  });
});
