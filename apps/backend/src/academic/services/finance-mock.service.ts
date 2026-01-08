import { Injectable } from '@nestjs/common';

@Injectable()
export class FinanceService {
    async checkFeeStatus(studentId: string): Promise<boolean> {
        // Mock logic: Always return true for now
        return true;
    }
}
