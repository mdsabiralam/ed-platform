import { Module } from '@nestjs/common';
import { SubstitutionService } from './services/substitution.service';
import { SubstitutionController } from './controllers/substitution.controller';
import { ExamController } from './controllers/exam.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TimetableService } from './services/timetable.service';
import { AttendanceModule } from '../attendance/attendance.module';
import { ExamService } from './services/exam.service';

@Module({
  imports: [PrismaModule, AttendanceModule],
  controllers: [SubstitutionController, ExamController],
  providers: [SubstitutionService, TimetableService, ExamService],
  exports: [SubstitutionService, TimetableService, ExamService],
})
export class AcademicModule {}
