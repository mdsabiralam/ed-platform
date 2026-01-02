import { validate } from 'class-validator';
import { CreateQuestionDto, QuestionType, DifficultyLevel, BloomsLevel } from './create-question.dto';

describe('CreateQuestionDto', () => {
  it('should pass validation for valid MCQ with options', async () => {
    const dto = new CreateQuestionDto();
    dto.subjectId = 'sub-1';
    dto.topicTag = 'Algebra';
    dto.type = QuestionType.MCQ;
    dto.difficulty = DifficultyLevel.EASY;
    dto.marks = 1;
    dto.content = 'What is 1+1?';
    dto.bloomsLevel = BloomsLevel.REMEMBER;
    dto.correctAnswer = '2';
    dto.options = { a: '1', b: '2' };

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation for MCQ without options', async () => {
    const dto = new CreateQuestionDto();
    dto.subjectId = 'sub-1';
    dto.topicTag = 'Algebra';
    dto.type = QuestionType.MCQ;
    dto.difficulty = DifficultyLevel.EASY;
    dto.marks = 1;
    dto.content = 'What is 1+1?';
    dto.bloomsLevel = BloomsLevel.REMEMBER;
    dto.correctAnswer = '2';
    // options missing

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const optionError = errors.find(e => e.property === 'options');
    expect(optionError).toBeDefined();
    expect(optionError.constraints).toHaveProperty('isNotEmpty');
  });

  it('should pass validation for SHORT_ANSWER without options', async () => {
    const dto = new CreateQuestionDto();
    dto.subjectId = 'sub-1';
    dto.topicTag = 'Algebra';
    dto.type = QuestionType.SHORT_ANSWER;
    dto.difficulty = DifficultyLevel.EASY;
    dto.marks = 1;
    dto.content = 'Explain integration.';
    dto.bloomsLevel = BloomsLevel.UNDERSTAND;
    dto.correctAnswer = 'It is the area under a curve.';
    // options missing is allowed

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept HTML and LaTeX in content', async () => {
    const dto = new CreateQuestionDto();
    dto.subjectId = 'sub-1';
    dto.topicTag = 'Calculus';
    dto.type = QuestionType.LONG_ANSWER;
    dto.difficulty = DifficultyLevel.HARD;
    dto.marks = 5;
    dto.content = '<p>Solve: \\(\\int_{0}^{\\pi} \\sin(x) dx\\)</p>'; // HTML + LaTeX
    dto.bloomsLevel = BloomsLevel.APPLY;
    dto.correctAnswer = '2';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
