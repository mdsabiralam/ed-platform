import { Test, TestingModule } from '@nestjs/testing';
import { QuestionBankController } from './question-bank.controller';
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionDto, QuestionType, DifficultyLevel, BloomsLevel } from './dto/create-question.dto';

describe('QuestionBankController', () => {
  let controller: QuestionBankController;
  let service: QuestionBankService;

  const mockService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionBankController],
      providers: [
        {
          provide: QuestionBankService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<QuestionBankController>(QuestionBankController);
    service = module.get<QuestionBankService>(QuestionBankService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a question', async () => {
      const dto: CreateQuestionDto = {
        subjectId: 'subject-123',
        topicTag: 'Algebra',
        type: QuestionType.MCQ,
        difficulty: DifficultyLevel.MEDIUM,
        marks: 5,
        content: 'Solve x + 2 = 4',
        bloomsLevel: BloomsLevel.APPLY,
        correctAnswer: '2',
        options: { a: '1', b: '2', c: '3', d: '4' },
      };

      const result = { id: 'q-1', ...dto, createdAt: new Date(), updatedAt: new Date(), imageUrl: null };
      mockService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });
});
