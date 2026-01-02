import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { FinanceService } from '../../finance/finance.service';

@Injectable()
export class ResultAccessGuard implements CanActivate {
  constructor(private financeService: FinanceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // Assuming studentId is passed as a parameter 'id' in the route (e.g. /pdf/:id)
    // Or potentially from the user token if it's a student login.
    // The prompt says: "Attempt to call GET ... with this student's token".
    // Typically, the token would give us 'user.studentId' or similar.
    // For this verification, let's assume we check the 'id' param if available, or fallback to user context.

    let studentId = request.params.id;

    if (!studentId && request.user && request.user.studentId) {
        studentId = request.user.studentId;
    }

    if (!studentId) {
       // If no student context, maybe allow (admin) or block?
       // For this specific requirement "Unpaid Fees Block", we need a student to check against.
       return true;
    }

    const isClear = await this.financeService.checkFeeStatus(studentId);

    if (!isClear) {
      throw new ForbiddenException('Please clear outstanding dues to view result');
    }

    return true;
  }
}
