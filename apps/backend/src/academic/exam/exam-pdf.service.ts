import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PDFDocument, rgb } from 'pdf-lib';

@Injectable()
export class ExamPdfService {
  constructor(private prisma: PrismaService) {}

  async generateRoomAllocationChart(date: Date): Promise<Buffer> {
    const schedules = await this.prisma.examSchedule.findMany({
      where: {
        date: date,
      },
      include: {
        class: true,
        subject: true,
        room: true,
        invigilationDuties: {
          include: {
            staff: {
              include: {
                user: true, // to get name? StaffProfile doesn't have name directly, User does.
              }
            }
          }
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;

    let y = height - 50;

    // Header
    page.drawText(`Room Allocation Chart - ${date.toDateString()}`, {
      x: 50,
      y,
      size: 18,
      color: rgb(0, 0, 0),
    });
    y -= 30;

    // Table Header
    const headers = ['Time', 'Class', 'Subject', 'Room', 'Invigilator'];
    const xPositions = [50, 120, 180, 280, 350];

    headers.forEach((header, index) => {
      page.drawText(header, { x: xPositions[index], y, size: 12, color: rgb(0, 0, 1) });
    });
    y -= 20;

    // Rows
    for (const schedule of schedules) {
        if (y < 50) {
            page = pdfDoc.addPage();
            y = height - 50;
        }

        const time = schedule.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const className = schedule.class?.name || 'N/A';
        const subject = schedule.subject?.name || 'N/A';
        const room = schedule.room?.name || 'N/A';

        // Invigilators: comma separated
        const invigilators = schedule.invigilationDuties.map(d => {
             // StaffProfile doesn't have name. User has firstName, lastName?
             // Let's assume User has firstName/lastName or Staff has it if denormalized?
             // Checking Schema: Student has firstName, lastName. User has NO name field directly!
             // Wait, Schema for User:
             // model User { ... profiles ... student ... guardian ... staffProfile ... }
             // Profile table has no name.
             // Student has firstName.
             // StaffProfile has designation.
             // Where is the Staff Name stored?
             // Usually in `StaffProfile` or `User`.
             // Schema check: `User` has `email`, `phone`. No name.
             // `StaffProfile` has `designation`, `department`. No name.
             // This is a schema gap. Assuming `User` might have linked `Profile`? No.
             // Usually `StaffProfile` should have `firstName` `lastName` or `User` should.
             // `Student` HAS `firstName`.
             // I will assume `User` SHOULD have `firstName` or `StaffProfile` SHOULD.
             // But looking at schema provided:
             /*
             model User { ... }
             model StaffProfile { ... userId ... }
             */
             // I will use `staff.userId` as name placeholder if name not found,
             // OR assume `firstName` exists on `User` but I missed it in schema read?
             // Let's re-read User schema in Schema block.
             /*
             model User {
               id ...
               email ...
               passwordHash ...
               phone ...
             }
             */
             // No name in User.
             /*
             model Student { ... firstName ... lastName ... }
             */
             // StaffProfile:
             /*
             model StaffProfile {
               id ...
               userId ...
               designation ...
             }
             */
             // Critical Schema Gap for Staff Name.
             // I'll use "Staff [ID]" for now.
             return `Staff ${d.staffId.substring(0, 5)}`;
        }).join(', ');

        page.drawText(time, { x: xPositions[0], y, size: 10 });
        page.drawText(className, { x: xPositions[1], y, size: 10 });
        page.drawText(subject, { x: xPositions[2], y, size: 10 });
        page.drawText(room, { x: xPositions[3], y, size: 10 });
        page.drawText(invigilators, { x: xPositions[4], y, size: 10 });

        y -= 20;
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
