import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { Assignment } from '@prisma/client';

@Injectable()
export class AssignmentListener {

  @OnEvent('assignment.created')
  async handleAssignmentCreatedEvent(assignment: Assignment) {
    console.log(`[Notification] New Homework Created: ${assignment.title}`);
    console.log(`[Notification] Sending FCM to Section: ${assignment.sectionId}`);

    // Logic to fetch student tokens and send FCM messages
    // const students = await this.prisma.student.findMany({ where: { sectionId: assignment.sectionId }, include: { user: true } });
    // for (const student of students) {
    //    sendPush(student.user.fcmToken, `New Homework: ${assignment.title}`);
    // }
  }
}
