import { Controller, Post, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IsUUID, IsNumber, IsDateString, Min, IsNotEmpty } from 'class-validator';

export class DefineExamDto {
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsUUID()
  @IsNotEmpty()
  termId: string;

  @IsUUID()
  @IsNotEmpty()
  typeId: string;

  @IsNumber()
  @Min(0.1)
  maxMarks: number;

  @IsDateString()
  @IsNotEmpty()
  examDate: string;
}

@Controller('api/academic/exam')
export class ExamController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('define')
  async defineExam(@Body() dto: DefineExamDto) {
    const { classId, subjectId, termId, typeId, maxMarks, examDate } = dto;

    // 1. Validate Relations
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');

    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new NotFoundException('Subject not found');

    const term = await this.prisma.examTerm.findUnique({ where: { id: termId } });
    if (!term) throw new NotFoundException('Exam Term not found');

    const type = await this.prisma.examType.findUnique({ where: { id: typeId } });
    if (!type) throw new NotFoundException('Exam Type not found');

    // 2. Validate Max Marks (Handled by DTO @Min(0.1))

    // 3. Create Exam
    const exam = await this.prisma.exam.create({
      data: {
        classId,
        subjectId,
        termId,
        typeId,
        maxMarks,
        examDate: new Date(examDate),
      },
      include: {
        class: true,
        subject: true,
        term: true,
        type: true,
      }
    });

    return exam;
  }
}
