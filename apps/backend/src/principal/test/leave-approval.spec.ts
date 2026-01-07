import { Test, TestingModule } from '@nestjs/testing';
import { PrincipalService } from '../principal.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Leave Approval Integration', () => {
  let service: PrincipalService;
  let prisma: PrismaService;

  const mockPrismaService = {
    leaveRequest: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    staffProfile: {
      count: jest.fn(),
    },
    staffAttendance: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrincipalService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PrincipalService>(PrincipalService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should approve a leave request', async () => {
    // 1. Setup Data
    const requestId = 'req-123';
    const mockRequest = { id: requestId, status: 'PENDING' };

    mockPrismaService.leaveRequest.update.mockResolvedValue({
      ...mockRequest,
      status: 'APPROVED',
    });

    // 2. Execute
    const result = await service.approveLeave(requestId);

    // 3. Verify
    expect(prisma.leaveRequest.update).toHaveBeenCalledWith({
      where: { id: requestId },
      data: { status: 'APPROVED' },
    });
    expect(result.status).toBe('APPROVED');
  });

  it('should reject a leave request with reason', async () => {
    const requestId = 'req-456';
    const reason = 'Staff shortage';

    mockPrismaService.leaveRequest.update.mockResolvedValue({
      id: requestId,
      status: 'REJECTED',
      rejectionReason: reason,
    });

    const result = await service.rejectLeave(requestId, reason);

    expect(prisma.leaveRequest.update).toHaveBeenCalledWith({
      where: { id: requestId },
      data: { status: 'REJECTED', rejectionReason: reason },
    });
    expect(result.status).toBe('REJECTED');
    expect(result.rejectionReason).toBe(reason);
  });
});
