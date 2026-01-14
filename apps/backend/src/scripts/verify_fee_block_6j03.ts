import { FinanceService } from '../finance/finance.service';
import { ResultAccessGuard } from '../common/guards/result-access.guard';
import { ForbiddenException } from '@nestjs/common';

// Mock FinanceService
class MockFinanceService extends FinanceService {
  constructor(private hasDues: boolean) {
    super();
  }

  async checkFeeStatus(studentId: string): Promise<boolean> {
    console.log(`[Mock] Checking fees for ${studentId}. Has dues? ${this.hasDues}`);
    return !this.hasDues; // If has dues, status is NOT clear (false).
  }
}

// Mock ExecutionContext
function createMockContext(studentId: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        params: { id: studentId },
        user: { studentId: studentId }, // Simulating token user
      }),
    }),
  } as any;
}

async function runVerification() {
  console.log('Verifying Unpaid Fees Block...');

  const studentWithDues = 'student-dues-123';
  const studentClear = 'student-clear-456';

  // 1. Scenario: Student HAS Dues
  console.log('\n--- Test 1: Student WITH Dues ---');
  const mockFinanceWithDues = new MockFinanceService(true); // hasDues = true
  const guardWithDues = new ResultAccessGuard(mockFinanceWithDues);
  const contextWithDues = createMockContext(studentWithDues);

  try {
    await guardWithDues.canActivate(contextWithDues);
    console.error('FAIL: Guard permitted access but should have blocked.');
    process.exit(1);
  } catch (error) {
    if (error instanceof ForbiddenException && error.message === 'Please clear outstanding dues to view result') {
      console.log('PASS: Guard blocked access with correct message: "Please clear outstanding dues to view result"');
    } else {
      console.error('FAIL: Guard threw unexpected error:', error);
      process.exit(1);
    }
  }

  // 2. Scenario: Student WITHOUT Dues
  console.log('\n--- Test 2: Student WITHOUT Dues ---');
  const mockFinanceClear = new MockFinanceService(false); // hasDues = false
  const guardClear = new ResultAccessGuard(mockFinanceClear);
  const contextClear = createMockContext(studentClear);

  try {
    const result = await guardClear.canActivate(contextClear);
    if (result === true) {
      console.log('PASS: Guard permitted access.');
    } else {
      console.error('FAIL: Guard returned false instead of true.');
      process.exit(1);
    }
  } catch (error) {
    console.error('FAIL: Guard threw error for clear student:', error);
    process.exit(1);
  }

  console.log('\nSUCCESS: Fee block logic verified.');
}

runVerification();
