import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
