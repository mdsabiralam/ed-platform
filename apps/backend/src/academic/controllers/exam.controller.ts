import { Controller, Post, Put, Delete, Get, Body, Param, Res, BadRequestException, NotFoundException, ForbiddenException, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { IsUUID, IsNumber, IsDateString, Min, IsNotEmpty, IsArray } from 'class-validator';
import { ExamLockedGuard } from '../guards/exam-locked.guard';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class GenerateAdmitCardDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  examGroupId: string;
}

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

  @Put(':id/publish')
  async publishExam(@Param('id') id: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException('Exam not found');

    const updated = await this.prisma.exam.update({
      where: { id },
      data: { isPublished: true },
    });

    return updated;
  }

  @Get('student/:studentId')
  async getStudentExams(@Param('studentId') studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        section: {
          include: {
            class: true,
          }
        }
      }
    });

    if (!student) throw new NotFoundException('Student not found');

    const classId = student.section.class.id;

    const exams = await this.prisma.exam.findMany({
      where: {
        classId: classId,
        isPublished: true, // Only show published exams
      },
      include: {
        subject: true,
        term: true,
        type: true,
      },
      orderBy: {
        examDate: 'asc',
      }
    });

    return exams;
  }

  @Post('admit-card/generate')
  async generateAdmitCard(@Body() dto: GenerateAdmitCardDto, @Res() res: Response) {
    const { studentId, examGroupId } = dto;

    // 1. Fetch Data
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        tenant: true,
        section: { include: { class: true } },
      },
    });

    if (!student) throw new NotFoundException('Student not found');

    const examGroup = await this.prisma.examGroup.findUnique({
      where: { id: examGroupId },
      include: {
        exams: {
          include: { subject: true },
          orderBy: { examDate: 'asc' },
        },
      },
    });

    if (!examGroup) throw new NotFoundException('Exam Group not found');

    // 2. Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // School Header
    const fontSize = 20;
    const text = student.tenant.name;
    const textWidth = boldFont.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height - 50,
      size: fontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText('Admit Card', {
      x: (width - boldFont.widthOfTextAtSize('Admit Card', 16)) / 2,
      y: height - 80,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Student Info
    const startY = height - 120;
    const lineHeight = 20;

    page.drawText(`Name: ${student.firstName} ${student.lastName}`, { x: 50, y: startY, size: 12, font });
    page.drawText(`Class: ${student.section.class.name} - ${student.section.name}`, { x: 50, y: startY - lineHeight, size: 12, font });
    page.drawText(`Roll No: ${student.rollNo || 'N/A'}`, { x: 300, y: startY, size: 12, font });
    page.drawText(`Exam: ${examGroup.name}`, { x: 300, y: startY - lineHeight, size: 12, font });

    // Exam Table Header
    const tableTop = startY - 60;
    page.drawLine({ start: { x: 50, y: tableTop }, end: { x: 550, y: tableTop }, thickness: 1 });
    page.drawText('Date', { x: 50, y: tableTop - 15, size: 12, font: boldFont });
    page.drawText('Subject', { x: 200, y: tableTop - 15, size: 12, font: boldFont });
    page.drawText('Time', { x: 400, y: tableTop - 15, size: 12, font: boldFont });
    page.drawLine({ start: { x: 50, y: tableTop - 25 }, end: { x: 550, y: tableTop - 25 }, thickness: 1 });

    // Exam Rows
    let currentY = tableTop - 45;
    for (const exam of examGroup.exams) {
      const dateStr = exam.examDate.toLocaleDateString();
      const timeStr = exam.examDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      page.drawText(dateStr, { x: 50, y: currentY, size: 10, font });
      page.drawText(exam.subject.name, { x: 200, y: currentY, size: 10, font });
      page.drawText(timeStr, { x: 400, y: currentY, size: 10, font });

      currentY -= 20;
    }

    // Signature
    const bottomY = 100;
    page.drawLine({ start: { x: 400, y: bottomY }, end: { x: 550, y: bottomY }, thickness: 1 });
    page.drawText("Principal's Signature", { x: 420, y: bottomY - 15, size: 10, font });

    // Serialize
    const pdfBytes = await pdfDoc.save();

    // Send Response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=admit-card-${student.rollNo}.pdf`,
      'Content-Length': pdfBytes.length,
    });

    res.end(Buffer.from(pdfBytes));
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
