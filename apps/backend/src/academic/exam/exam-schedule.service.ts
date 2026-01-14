// 6.C.06 & 6.C.08: Invigilation and Room Allocation
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PDFDocument, rgb } from 'pdf-lib';

@Injectable()
export class ExamScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  // 6.C.06: Assign Invigilator with Validation
  async assignInvigilator(scheduleId: string, staffId: string, roomId: string) {
    // 1. Fetch Schedule details including subject
    const schedule = await this.prisma.examSchedule.findUnique({
      where: { id: scheduleId },
      include: {
          subject: true,
          exam: { include: { class: true } }
      }
    });
    if (!schedule) throw new NotFoundException('Exam Schedule not found');

    // 2. Fetch Teacher details (to check subject specialization)
    // Note: Assuming StaffProfile implies subject mapping or we check routine.
    // For this strict requirement: "Teacher cannot invigilate their own subject".
    // We check if this teacher teaches THIS subject to THIS class.

    // Check Routine for conflict (Is this teacher assigned to this subject/class in general?)
    const isSubjectTeacher = await this.prisma.routineEntry.findFirst({
        where: {
            classId: schedule.exam.classId,
            subjectId: schedule.subjectId,
            teacherId: staffId
        }
    });

    if (isSubjectTeacher) {
        throw new ConflictException('Conflict: Teacher cannot invigilate their own subject exam.');
    }

    return this.prisma.invigilationDuty.create({
      data: {
        examScheduleId: scheduleId,
        staffId,
        roomId
      }
    });
  }

  // 6.C.08: Generate Room Allocation PDF
  async generateRoomAllocationPdf(tenantId: string, examDate: Date): Promise<Buffer> {
    // Fetch duties for the date
    const duties = await this.prisma.invigilationDuty.findMany({
        where: {
            examSchedule: {
                date: examDate,
                exam: { tenantId }
            }
        },
        include: {
            staff: { include: { user: true } },
            room: true,
            examSchedule: {
                include: {
                    subject: true,
                    exam: { include: { class: true } }
                }
            }
        },
        orderBy: { examSchedule: { startTime: 'asc' } }
    });

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    page.drawText(`Room Allocation Chart: ${examDate.toISOString().split('T')[0]}`, { x: 50, y: height - 50, size: 20 });

    let y = height - 100;

    // Simple Table Header
    page.drawText(`Time | Class | Subject | Room | Invigilator`, { x: 50, y, size: 12 });
    y -= 20;

    for (const duty of duties) {
        const time = duty.examSchedule.startTime.toISOString().split('T')[1].substring(0,5);
        const className = duty.examSchedule.exam.class.name;
        const subject = duty.examSchedule.subject.name;
        const room = duty.room ? duty.room.name : 'N/A';
        const teacher = `${duty.staff.user.firstName} ${duty.staff.user.lastName}`;

        page.drawText(`${time} | ${className} | ${subject} | ${room} | ${teacher}`, { x: 50, y, size: 10 });
        y -= 20;

        if (y < 50) {
            // Add new page if full (simplified)
            // page = pdfDoc.addPage(); y = height - 50;
        }
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
