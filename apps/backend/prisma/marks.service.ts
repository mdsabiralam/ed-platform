import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStudentMarkDto } from './dto/marks.dto';

@Injectable()
export class MarksService {
  constructor(private prisma: PrismaService) {}

  // 6.D.02: Update or Create Mark
  async updateMark(dto: UpdateStudentMarkDto) {
    // 2. Auto-calculate total_marks
    let total = dto.theory + dto.practical;

    // 3. Handle Absent case
    if (dto.isAbsent) {
      total = 0; 
    }

    // 1. Upsert Record
    return this.prisma.studentMark.upsert({
      where: {
        studentId_examId_subjectId: {
          studentId: dto.studentId,
          examId: dto.examId,
          subjectId: dto.subjectId,
        },
      },
      update: {
        theoryMarks: dto.theory,
        practicalMarks: dto.practical,
        totalMarks: total,
        isAbsent: dto.isAbsent,
        remarks: dto.remarks,
      },
      create: {
        studentId: dto.studentId,
        examId: dto.examId,
        subjectId: dto.subjectId,
        theoryMarks: dto.theory,
        practicalMarks: dto.practical,
        totalMarks: total,
        isAbsent: dto.isAbsent,
        remarks: dto.remarks,
      },
    });
  }
}