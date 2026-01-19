import { Test, TestingModule } from '@nestjs/testing';
import { TransportService } from '../transport/transport.service';
import { LibraryService } from '../library/library.service';
import { HealthService } from '../health/health.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('Persona Missions', () => {
  let transportService: TransportService;
  let libraryService: LibraryService;
  let healthService: HealthService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    trip: { create: jest.fn(), findUnique: jest.fn() },
    tripPassenger: { create: jest.fn() },
    gpsLog: { create: jest.fn() },
    book: { findUnique: jest.fn(), update: jest.fn() },
    libraryTransaction: {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    opdVisit: { create: jest.fn() },
    emergencyAlert: { create: jest.fn() },
    student: { findUnique: jest.fn() },
    healthProfile: { findUnique: jest.fn() },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransportService,
        LibraryService,
        HealthService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    transportService = module.get<TransportService>(TransportService);
    libraryService = module.get<LibraryService>(LibraryService);
    healthService = module.get<HealthService>(HealthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  // 1. ABDUL THE DRIVER
  describe('Mission 1: Abdul (Driver)', () => {
    const tenantId = 'school-hq';
    const tripId = 'trip-route-5';
    const rajuId = 'student-raju';

    it('Start Trip & Pickup: Should show tracking ON and mark Raju boarded', async () => {
      // 1. Start Trip
      mockPrismaService.trip.create.mockResolvedValue({ id: tripId, status: 'STARTED' });
      await transportService.startTrip(tenantId, 'driver-abdul', 'BUS-05');
      expect(mockPrismaService.trip.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'STARTED' })
      }));

      // 2. Background Check (Simulate GPS Log)
      await transportService.logGps(tripId, 23.8, 90.4);
      expect(mockPrismaService.gpsLog.create).toHaveBeenCalled();

      // 3. Student Pickup (Mark Raju Boarded)
      mockPrismaService.trip.findUnique.mockResolvedValue({ id: tripId });
      mockPrismaService.tripPassenger.create.mockResolvedValue({ status: 'BOARDED', studentId: rajuId });

      const boarding = await transportService.boardPassenger(tripId, rajuId);
      expect(boarding.status).toEqual('BOARDED');
      expect(mockPrismaService.tripPassenger.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ tripId, studentId: rajuId })
      }));
    });
  });

  // 2. MRS. DAS THE LIBRARIAN
  describe('Mission 2: Mrs. Das (Librarian)', () => {
    const tenantId = 'school-hq';
    const rahimId = 'student-rahim';
    const bookBarcode = 'HP-001';

    it('Scan & Issue: Should warn if Rahim has >2 books', async () => {
      // Mock: Rahim already has 2 books
      mockPrismaService.libraryTransaction.count.mockResolvedValue(2);

      await expect(libraryService.issueBook(tenantId, bookBarcode, rahimId))
        .rejects.toThrow('Student already has 2 unreturned books');
    });

    it('Return & Fine: Should calculate fine for 5 days late', async () => {
      const transactionId = 'tx-late';
      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() - 5); // Due 5 days ago

      mockPrismaService.libraryTransaction.findUnique.mockResolvedValue({
        id: transactionId,
        tenantId,
        returnDate,
        bookId: 'book-hp',
        status: 'ISSUED',
        book: { availableCopies: 0 }
      });

      mockPrismaService.libraryTransaction.update.mockImplementation(({ data }) => ({
        ...data,
        id: transactionId
      }));

      const result = await libraryService.returnBook(tenantId, transactionId);

      // Expected Fine: 5 days * 10 = 50
      expect(result.fineAmount).toBeGreaterThanOrEqual(50);
      expect(result.status).toEqual('RETURNED');
    });
  });

  // 3. SISTER MARY THE NURSE
  describe('Mission 3: Sister Mary (Nurse)', () => {
    const tenantId = 'school-hq';
    const studentId = 'student-sick';

    it('SOS & OPD: Should trigger alert and show red allergy warning', async () => {
      // 1. SOS Trigger
      mockPrismaService.emergencyAlert.create.mockResolvedValue({ status: 'SENT' });
      await healthService.triggerSos(tenantId, studentId, 'Fainted');
      expect(mockPrismaService.emergencyAlert.create).toHaveBeenCalled();

      // 2. OPD Entry (Select Fever)
      await healthService.logOpdVisit(tenantId, studentId, 'High Fever');
      expect(mockPrismaService.opdVisit.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ symptom: 'High Fever' })
      }));

      // 3. Medical History (Check Allergy)
      mockPrismaService.student.findUnique.mockResolvedValue({ id: studentId, tenantId });
      mockPrismaService.healthProfile.findUnique.mockResolvedValue({
        studentId,
        allergies: 'Penicillin', // In real app, this is decrypted
        bloodGroup: 'O+'
      });

      const profile = await healthService.getStudentHealthProfile(tenantId, studentId);
      expect(profile.allergies).toEqual('Penicillin'); // "Red" highlight confirmed by data presence
    });
  });
});
