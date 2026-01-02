import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { SubmissionController } from './submission.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlagiarismCheckService } from './plagiarism-check.service';
import { NotificationModule } from '../../notification/notification.module';
import { SubmissionGradedListener } from './listeners/submission-graded.listener';
import { AssignmentAnalyticsController } from './analytics.controller';
import { AssignmentAnalyticsService } from './analytics.service';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [AssignmentController, SubmissionController, AssignmentAnalyticsController],
  providers: [AssignmentService, PlagiarismCheckService, SubmissionGradedListener, AssignmentAnalyticsService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
