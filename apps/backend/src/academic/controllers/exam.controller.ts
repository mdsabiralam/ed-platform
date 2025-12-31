import { Controller, Post, Put, Delete, Body, Param, BadRequestException, NotFoundException, ForbiddenException, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IsUUID, IsNumber, IsDateString, Min, IsNotEmpty, IsArray } from 'class-validator';
import { ExamLockedGuard } from '../guards/exam-locked.guard';

export class AssignExamGroupDto {
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  examIds: string[];
}

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

  @Post('assign-group')
  async assignExamGroup(@Body() dto: AssignExamGroupDto) {
    const { groupId, examIds } = dto;

    // 1. Validate Group
    const group = await this.prisma.examGroup.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Exam Group not found');

    // 2. Validate Exams Existence (Optional but good)
    // Check if any exam is locked
    const lockedExams = await this.prisma.exam.findMany({
      where: {
        id: { in: examIds },
        isLocked: true,
      },
    });

    if (lockedExams.length > 0) {
      throw new ForbiddenException(`Cannot assign group. The following exams are locked: ${lockedExams.map(e => e.id).join(', ')}`);
    }

    // 3. Update Exams
    const result = await this.prisma.exam.updateMany({
      where: {
        id: { in: examIds },
      },
      data: {
        groupId: groupId,
      },
    });

    return { message: 'Exams assigned to group successfully', count: result.count };
  }

  @Put(':id/lock')
  async lockExam(@Param('id') id: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException('Exam not found');

    const updated = await this.prisma.exam.update({
      where: { id },
      data: { isLocked: true },
    });

    return updated;
  }

  @Delete(':id')
  @UseGuards(ExamLockedGuard)
  async deleteExam(@Param('id') id: string) {
    // This endpoint demonstrates the guard.
    // In a real app, you might soft delete or check other dependencies.
    const deleted = await this.prisma.exam.delete({
      where: { id },
    });
    return deleted;
  }
}
