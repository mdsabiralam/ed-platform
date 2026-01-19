import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should generate a structured lesson plan', async () => {
    const topic = "Newton's Laws";
    const result = await service.generateLessonPlan(topic);

    expect(result.topic).toBe(topic);
    expect(result.learningOutcomes).toBeDefined();
    expect(result.structure).toBeDefined();
    expect(Array.isArray(result.learningOutcomes)).toBe(true);
  });
});
