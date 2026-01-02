import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { SubmissionController } from './submission.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AssignmentController, SubmissionController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
