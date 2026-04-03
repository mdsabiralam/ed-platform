import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionController } from '../submission.controller';
import { AssignmentService } from '../assignment.service';

describe('SubmissionController', () => {
  let controller: SubmissionController;
  let service: AssignmentService;

  const mockAssignmentService = {
    saveFeedbackFile: jest.fn().mockImplementation((id, url) => {
      return { id, feedbackFileUrl: url };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionController],
      providers: [
        {
          provide: AssignmentService,
          useValue: mockAssignmentService,
        },
      ],
    }).compile();

    controller = module.get<SubmissionController>(SubmissionController);
    service = module.get<AssignmentService>(AssignmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFeedbackFile', () => {
    it('should upload annotated PDF and update feedbackFileUrl', async () => {
      const submissionId = 'sub-123';
      const mockFile = {
        fieldname: 'file',
        originalname: 'feedback.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test'),
        size: 1024,
        filename: 'random_filename.pdf',
        path: 'uploads/feedback/random_filename.pdf',
      } as Express.Multer.File;

      const result = await controller.uploadFeedbackFile(submissionId, mockFile);

      expect(service.saveFeedbackFile).toHaveBeenCalledWith(
        submissionId,
        `/uploads/feedback/${mockFile.filename}`,
      );
      expect(result).toEqual({
        id: submissionId,
        feedbackFileUrl: `/uploads/feedback/${mockFile.filename}`,
      });
    });
  });
});
