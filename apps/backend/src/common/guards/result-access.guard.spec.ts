import { Test, TestingModule } from '@nestjs/testing';
import { ResultAccessGuard } from './result-access.guard';
import { FinanceService } from '../../finance/finance.service';
import { LibraryService } from '../../library/library.service';
import { ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ResultAccessGuard', () => {
  let guard: ResultAccessGuard;
  let financeService: FinanceService;
  let libraryService: LibraryService;

  const mockFinanceService = {
    checkFeeStatus: jest.fn(),
  };

  const mockLibraryService = {
    checkLibraryDues: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResultAccessGuard,
        { provide: FinanceService, useValue: mockFinanceService },
        { provide: LibraryService, useValue: mockLibraryService },
      ],
    }).compile();

    guard = module.get<ResultAccessGuard>(ResultAccessGuard);
    financeService = module.get<FinanceService>(FinanceService);
    libraryService = module.get<LibraryService>(LibraryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockContext = (params: any = {}) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          params,
        }),
      }),
    } as ExecutionContext;
  };

  it('should allow access if both fee and library checks pass', async () => {
    mockFinanceService.checkFeeStatus.mockResolvedValue(true);
    mockLibraryService.checkLibraryDues.mockResolvedValue(true);

    const context = createMockContext({ id: 'student123' });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockFinanceService.checkFeeStatus).toHaveBeenCalledWith('student123');
    expect(mockLibraryService.checkLibraryDues).toHaveBeenCalledWith('student123');
  });

  it('should throw ForbiddenException if fees are not paid', async () => {
    mockFinanceService.checkFeeStatus.mockResolvedValue('Outstanding Fees Detected: 100');
    mockLibraryService.checkLibraryDues.mockResolvedValue(true);

    const context = createMockContext({ id: 'student123' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: {
        errorCode: 'FEE_DUES_PENDING',
        message: 'Outstanding Fees Detected: 100',
      },
    });
  });

  it('should throw ForbiddenException if library dues are pending', async () => {
    mockFinanceService.checkFeeStatus.mockResolvedValue(true);
    mockLibraryService.checkLibraryDues.mockResolvedValue('Library books not returned');

    const context = createMockContext({ id: 'student123' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toMatchObject({
        response: {
            errorCode: 'LIBRARY_DUES_PENDING',
            message: 'Library books not returned',
        }
    });
  });

  it('should throw ForbiddenException if outstanding library fines', async () => {
    mockFinanceService.checkFeeStatus.mockResolvedValue(true);
    mockLibraryService.checkLibraryDues.mockResolvedValue('Outstanding Library Fines');

    const context = createMockContext({ id: 'student123' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toMatchObject({
        response: {
            errorCode: 'LIBRARY_DUES_PENDING',
            message: 'Outstanding Library Fines',
        }
    });
  });

  it('should throw BadRequestException if student ID is missing', async () => {
    const context = createMockContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(BadRequestException);
  });
});
