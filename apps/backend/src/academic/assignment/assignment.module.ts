import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { SubmissionController } from './submission.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlagiarismCheckService } from './plagiarism-check.service';
import { NotificationModule } from '../../notification/notification.module';
import { SubmissionGradedListener } from './listeners/submission-graded.listener';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [AssignmentController, SubmissionController],
  providers: [AssignmentService, PlagiarismCheckService, SubmissionGradedListener],
  exports: [AssignmentService],
})
export class AssignmentModule {}
