import { Module } from '@nestjs/common';
import { AttendanceModule } from './attendance/attendance.module';
import { MarksModule } from './marks/marks.module';
import { StudentModule } from './student/student.module';
import { HomeworkModule } from './homework/homework.module';

@Module({
  imports: [AttendanceModule, MarksModule, StudentModule, HomeworkModule],
})
export class AcademicModule {}
