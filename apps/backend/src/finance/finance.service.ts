import { Injectable } from '@nestjs/common';
import { ResultService } from '../academic/results/result.service';

@Injectable()
export class FinanceService {
  constructor(private readonly resultService: ResultService) {}

  async checkFeeStatus(studentId: string): Promise<boolean | string> {
    // Forward the call to ResultService as per new architecture instruction
    // Note: Ideally ResultService shouldn't be handling this, but prompt mandated implementation in ResultService.
    // However, if ResultService is in academic module, injecting it here creates circular dependency if AcademicModule imports FinanceModule.
    // FinanceModule is imported in AppModule. AcademicModule is likely not yet imported or created.
    // But ResultService is what I created.

    // Actually, I should probably implement the logic HERE using Prisma, or inject ResultService.
    // But if I inject ResultService, I need to make sure modules are wired.
    // The prompt asked to "Implement the checkFeeStatus logic in ResultService".
    // AND the guard uses FinanceService.
    // So the Guard calls FinanceService, which calls ResultService?
    // That seems backwards. ResultService usually depends on FinanceService.

    // Alternative: Update the Guard to use ResultService for fee check?
    // But the Guard is already implemented.

    // Let's assume the user wants me to SWAP the implementation or use ResultService directly in Guard.
    // I will modify the Guard to use ResultService.
    return this.resultService.checkFeeStatus(studentId);
  }
}
