import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class NotificationTemplateService {
  processTemplate(template: string, user: User): string {
    let message = template;

    // Replace standard variables
    if (user.phone) message = message.replace(/{{phone}}/g, user.phone);
    if (user.email) message = message.replace(/{{email}}/g, user.email);

    // We can extend this to include student data if user is loaded with student relation
    // For now, handling basic user fields
    // Assuming 'firstName' might be on a profile or we need to cast user
    // The User model doesn't have firstName directly (it's in Student/Staff/Guardian),
    // but the prompt example says "user.firstName".
    // I will try to use the relation if available or fallback.

    // Check for other potential fields on the user object (if it's an extended object)
    const anyUser = user as any;
    if (anyUser.firstName) message = message.replace(/{{name}}/g, anyUser.firstName);
    if (anyUser.student?.firstName) message = message.replace(/{{name}}/g, anyUser.student.firstName);

    // Due amount replacement (if user has student and feeLedger loaded)
    if (anyUser.student?.feeLedger) {
      const due = anyUser.student.feeLedger.totalInvoiced - anyUser.student.feeLedger.totalPaid;
      message = message.replace(/{{due_amount}}/g, due.toString());
    }

    return message;
  }
}
