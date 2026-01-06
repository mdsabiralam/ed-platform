import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AttendanceMarkedEvent } from './attendance-marked.event';

@Injectable()
export class AttendanceListener {

  @OnEvent('attendance.marked')
  async handleAttendanceMarkedEvent(event: AttendanceMarkedEvent) {
    if (event.status === 'ABSENT') {
      console.log(`Triggering SMS for Absent Student: ${event.studentId}`);
      // In a real scenario, we would add a job to BullMQ here
      // this.smsQueue.add('send-sms', { studentId: event.studentId, message: "Your child is absent..." });
    }
  }
}
