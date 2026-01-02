import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FinanceService } from '../../finance/finance.service';
import { LibraryService } from '../../library/library.service';

@Injectable()
export class ResultAccessGuard implements CanActivate {
  constructor(
    private readonly financeService: FinanceService,
    private readonly libraryService: LibraryService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const studentId = request.params.id; // Assuming :id is the studentId as per instructions

    if (!studentId) {
       // If logic dictates extracting studentId from somewhere else (e.g. user session), it would go here.
       // But the prompt says "Intercept the request to GET /api/academic/marksheet/pdf/:id. Extract the studentId."
       // It implies :id is the studentId or mapped to it.
       // Given "Extract the studentId", and the route is /:id, if :id IS the studentId, then we have it.
       // If :id is a marksheetId, we would need to look it up.
       // I will assume :id is the studentId for this implementation or check if it matches the pattern.
       // However, typically "Extract the studentId" *from the request* to that endpoint often implies the ID in the URL is the student ID in these simple scenarios.
       throw new BadRequestException('Student ID is missing in the request parameters.');
    }

    const [isFeePaid, hasNoLibraryDues] = await Promise.all([
      this.financeService.checkFeeStatus(studentId),
      this.libraryService.checkLibraryDues(studentId),
    ]);

    if (!isFeePaid) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Fees not cleared.',
        errorCode: 'FEE_DUES_PENDING',
      });
    }

    if (!hasNoLibraryDues) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Library dues pending.',
        errorCode: 'LIBRARY_DUES_PENDING',
      });
    }

    return true;
  }
}
