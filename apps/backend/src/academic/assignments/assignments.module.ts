import { Module } from '@nestjs/common';
import { AssignmentService } from './assignments.service';
import { AssignmentController, StudentAssignmentController, UploadController } from './assignments.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AssignmentListener } from '../../events/assignment.listener';
import { AssignmentCronService } from '../../jobs/assignment.cron';

@Module({
  imports: [PrismaModule],
  controllers: [AssignmentController, StudentAssignmentController, UploadController],
  providers: [AssignmentService, AssignmentListener, AssignmentCronService],
})
export class AssignmentModule {}
