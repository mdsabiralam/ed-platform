import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DefineExamDto, CreateExamGroupDto, AssignExamGroupDto, GenerateAdmitCardDto } from './dto/exam.dto';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  // 6.A.03: Define Exam
  async defineExam(dto: DefineExamDto) {
    // 1. Validate Class and Subject exist (Assuming generic check or specific service call)
    // Note: In a real scenario, you would check this.prisma.class.findUnique(...)
    // For now, we proceed to save as requested.

    // 2. Ensure maxMarks is positive (Handled by DTO @IsPositive)

    // 3. Save to Exam table
    return this.prisma.exam.create({
      data: {
        classId: dto.classId,
        subjectId: dto.subjectId,
        termId: dto.termId,
        typeId: dto.typeId,
        maxMarks: dto.maxMarks,
        examDate: new Date(dto.examDate),
      },
    });
  }

  // 6.A.04: Create Exam Group
  async createExamGroup(dto: CreateExamGroupDto) {
    return this.prisma.examGroup.create({
      data: {
        name: dto.name,
        tenantId: dto.tenantId,
      },
    });
  }

  // 6.A.04: Assign Exams to Group
  async assignExamsToGroup(dto: AssignExamGroupDto) {
    const group = await this.prisma.examGroup.findUnique({
      where: { id: dto.examGroupId },
    });

    if (!group) {
      throw new NotFoundException('Exam Group not found');
    }

    // Update multiple exams to link them to the group
    return this.prisma.exam.updateMany({
      where: {
        id: { in: dto.examIds },
      },
      data: {
        examGroupId: dto.examGroupId,
      },
    });
  }

  // 6.A.05: Lock Exam
  async lockExam(id: string) {
    return this.prisma.exam.update({
      where: { id },
      data: { is_locked: true },
    });
  }

  // 6.A.06: Publish Exam
  async publishExam(id: string) {
    return this.prisma.exam.update({
      where: { id },
      data: { is_published: true },
    });
  }

  // Helper: Check if exam is locked before modification
  private async validateExamModification(id: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException('Exam not found');
    
    if (exam.is_locked) {
      throw new ForbiddenException('Exam is locked and cannot be modified or deleted.');
    }
    return exam;
  }

  // 6.A.05: Update Exam (Protected)
  async updateExam(id: string, data: any) {
    await this.validateExamModification(id);
    return this.prisma.exam.update({
      where: { id },
      data,
    });
  }

  // 6.A.05: Delete Exam (Protected)
  async deleteExam(id: string) {
    await this.validateExamModification(id);
    return this.prisma.exam.delete({ where: { id } });
  }

  // 6.A.06: Get Exams for Student (Filtered by is_published)
  async getExamsForStudent(studentId: string) {
    // 1. Find student to get their Class ID (via Section)
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { section: true },
    });

    if (!student || !student.section) {
      throw new NotFoundException('Student or Class information not found');
    }

    // 2. Fetch only PUBLISHED exams for that class
    return this.prisma.exam.findMany({
      where: {
        classId: student.section.classId,
        is_published: true,
      },
      include: {
        term: true,
        type: true,
      },
      orderBy: { examDate: 'asc' },
    });
  }

  // Mock method to simulate fetching attendance from AttendanceService (Division 5)
  private async getStudentAttendance(studentId: string): Promise<number> {
    // In a real scenario, inject AttendanceService and call it here.
    // For now, returning a mock value (e.g., 80%).
    return 80; 
  }

  // 6.A.08: Generate Admit Card PDF
  async generateAdmitCard(dto: GenerateAdmitCardDto): Promise<Uint8Array> {
    // 6.A.09: Admit Card Attendance Check
    if (!dto.override_pass) {
      const attendancePercent = await this.getStudentAttendance(dto.studentId);
      if (attendancePercent < 75) {
        throw new ForbiddenException('Attendance is below 75%. Contact Admin.');
      }
    }

    // 1. Fetch Student & Exam Group details
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      include: { section: { include: { class: true } } },
    });

    const group = await this.prisma.examGroup.findUnique({
      where: { id: dto.examGroupId },
      include: { exams: { include: { type: true }, orderBy: { examDate: 'asc' } } },
    });

    if (!student || !group) {
      throw new NotFoundException('Student or Exam Group not found');
    }

    // 2. Fetch Hall Ticket details (if exists)
    const hallTicket = await this.prisma.hallTicket.findUnique({
      where: {
        studentId_examGroupId: {
          studentId: dto.studentId,
          examGroupId: dto.examGroupId,
        },
      },
    });

    // 3. Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Header
    page.drawText('ADMIT CARD', { x: 50, y: height - 50, size: 20, font: boldFont });
    page.drawText(`Exam: ${group.name}`, { x: 50, y: height - 80, size: 14, font });

    // Student Info
    page.drawText(`Name: ${student.firstName} ${student.lastName}`, { x: 50, y: height - 120, size: 12, font });
    page.drawText(`Class: ${student.section?.class?.name || 'N/A'} (${student.section?.name || 'N/A'})`, { x: 50, y: height - 140, size: 12, font });
    page.drawText(`Roll No: ${student.rollNo || 'N/A'}`, { x: 50, y: height - 160, size: 12, font });

    if (hallTicket) {
      page.drawText(`Center: ${hallTicket.exam_center}`, { x: 300, y: height - 120, size: 12, font });
      page.drawText(`Seat No: ${hallTicket.seat_number || 'N/A'}`, { x: 300, y: height - 140, size: 12, font });
    }

    // Exam Table
    let yPosition = height - 220;
    page.drawText('Date', { x: 50, y: yPosition, size: 12, font: boldFont });
    page.drawText('Subject', { x: 150, y: yPosition, size: 12, font: boldFont });
    page.drawText('Type', { x: 350, y: yPosition, size: 12, font: boldFont });

    yPosition -= 20;
    for (const exam of group.exams) {
      page.drawText(exam.examDate.toISOString().split('T')[0], { x: 50, y: yPosition, size: 10, font });
      page.drawText(exam.subjectId, { x: 150, y: yPosition, size: 10, font }); // Using ID as name for now
      page.drawText(exam.type.name, { x: 350, y: yPosition, size: 10, font });
      yPosition -= 20;
    }

    // Footer
    page.drawText('Principal Signature', { x: 400, y: 50, size: 12, font });
    page.drawLine({ start: { x: 400, y: 70 }, end: { x: 550, y: 70 }, thickness: 1, color: rgb(0, 0, 0) });

    return pdfDoc.save();
  }
}