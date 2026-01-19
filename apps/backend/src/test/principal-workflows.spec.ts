import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service';
import { CertificateService } from '../academic/certificate/certificate.service';
import { SubstitutionService } from '../academic/substitution/substitution.service';
import { FinanceService } from '../finance/finance.service';
import { PDFDocument } from 'pdf-lib';

describe('Principal Workflows Simulation', () => {
  let prismaMock: DeepMockProxy<PrismaService>;
  let certService: CertificateService;
  let subService: SubstitutionService;
  let financeService: FinanceService;

  beforeEach(() => {
    prismaMock = mockDeep<PrismaService>();
    certService = new CertificateService(prismaMock);
    subService = new SubstitutionService(prismaMock);
    financeService = new FinanceService(prismaMock);
  });

  it('Workflow 1: Digital Approval (Transfer Certificate)', async () => {
    console.info("\n--- Workflow 1: Digital Approval (Transfer Certificate) ---");
    const requestId = "req-123";
    const studentData = {
      firstName: "John",
      lastName: "Doe",
      admissionNo: "STU-2024-001"
    };

    prismaMock.transferCertificate.findUnique.mockResolvedValue({
      id: requestId,
      student: studentData,
    } as any);

    prismaMock.transferCertificate.update.mockResolvedValue({
        id: requestId,
        status: 'APPROVED',
        certificateUrl: `https://storage.example.com/certificates/${requestId}.pdf`
    } as any);

    const certResult = await certService.approveRequest(requestId, "Principal Skinner");

    expect(certResult.url).toBeDefined();
    expect(certResult.pdfBytes.length).toBeGreaterThan(0);
    console.info(`✅ Certificate Approved! PDF Generated. URL: ${certResult.url}`);

    // Verify update was called
    expect(prismaMock.transferCertificate.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: requestId },
      data: expect.objectContaining({ status: 'APPROVED' })
    }));
  });

  it('Workflow 2: Staff Oversight (Substitution)', async () => {
    console.info("\n--- Workflow 2: Staff Oversight (Substitution) ---");
    const routineId = "routine-101";
    const absentTeacherId = "staff-A";
    const subTeacherId = "staff-B";

    prismaMock.routineEntry.findUnique.mockResolvedValue({
      id: routineId,
      teacherId: absentTeacherId,
    } as any);

    prismaMock.routineSubstitution.create.mockResolvedValue({
      id: "sub-999",
      routineEntryId: routineId,
      originalTeacherId: absentTeacherId,
      substituteTeacherId: subTeacherId,
      status: 'ASSIGNED',
      date: new Date()
    } as any);

    console.info(`👀 Teacher ${absentTeacherId} is Absent. Assigning ${subTeacherId}...`);
    const subResult = await subService.assignSubstitution(routineId, absentTeacherId, subTeacherId);

    expect(subResult.status).toBe('ASSIGNED');
    console.info(`✅ Substitution Assigned Successfully! Record ID: ${subResult.id}`);

    expect(prismaMock.routineSubstitution.create).toHaveBeenCalled();
  });

  it('Workflow 3: Financial Pulse (Daily Collection)', async () => {
    console.info("\n--- Workflow 3: Financial Pulse (Daily Collection) ---");
    const today = new Date();

    prismaMock.feeReceipt.aggregate.mockResolvedValue({
      _sum: { amount: 50000 }
    } as any);

    console.info(`💰 Checking Daily Collection...`);
    const totalCollection = await financeService.getDailyCollection(today);

    console.info(`   System reports: ${totalCollection}`);
    expect(totalCollection).toBe(50000);
    console.info(`✅ Financial Pulse: MATCHED. Collections verified.`);
  });
});
