import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfService } from '../common/services/pdf.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudentController],
  providers: [StudentService, PdfService],
  exports: [StudentService],
})
export class StudentModule {}
