import { Test, TestingModule } from '@nestjs/testing';
import { TransportService } from '../transport/transport.service';
import { LibraryService } from '../library/library.service';
import { HealthService } from '../health/health.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('Role Based Scenarios', () => {
  let transportService: TransportService;
  let libraryService: LibraryService;
  let healthService: HealthService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    trip: {
      create: jest.fn(),
    },
    gpsLog: {
      create: jest.fn(),
    },
    book: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    libraryTransaction: {
      create: jest.fn(),
    },
    opdVisit: {
      create: jest.fn(),
    },
    emergencyAlert: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransportService,
        LibraryService,
        HealthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    transportService = module.get<TransportService>(TransportService);
    libraryService = module.get<LibraryService>(LibraryService);
    healthService = module.get<HealthService>(HealthService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('Driver Scenario', () => {
    it('should start a trip and log GPS coordinates', async () => {
      const tenantId = 'tenant-1';
      const driverId = 'driver-1';
      const vehicleNo = 'BUS-001';
      const tripId = 'trip-1';

      mockPrismaService.trip.create.mockResolvedValue({
        id: tripId,
        tenantId,
        driverId,
        vehicleNo,
        status: 'STARTED',
        startTime: new Date(),
      });

      mockPrismaService.gpsLog.create.mockResolvedValue({
        id: 'log-1',
        tripId,
        latitude: 23.8103,
        longitude: 90.4125,
        timestamp: new Date(),
      });

      // Start Trip
      const trip = await transportService.startTrip(tenantId, driverId, vehicleNo);
      expect(trip.id).toEqual(tripId);
      expect(mockPrismaService.trip.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          status: 'STARTED',
          driverId,
        })
      }));

      // Log GPS
      await transportService.logGps(tripId, 23.8103, 90.4125);
      expect(mockPrismaService.gpsLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          tripId,
          latitude: 23.8103,
        })
      }));

      // Simulate movement
      await transportService.logGps(tripId, 23.8105, 90.4127);
      expect(mockPrismaService.gpsLog.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('Librarian Scenario', () => {
    it('should fetch book details and issue to student decreasing inventory', async () => {
      const tenantId = 'tenant-1';
      const barcode = 'ISBN-12345';
      const studentId = 'student-1';
      const bookId = 'book-1';

      const mockBook = {
        id: bookId,
        tenantId,
        barcode,
        title: 'Physics I',
        availableCopies: 5,
      };

      mockPrismaService.book.findUnique.mockResolvedValue(mockBook);
      mockPrismaService.libraryTransaction.create.mockResolvedValue({
        id: 'trans-1',
        bookId,
        studentId,
        status: 'ISSUED',
      });
      mockPrismaService.book.update.mockResolvedValue({
        ...mockBook,
        availableCopies: 4,
      });

      // Scan Book
      const book = await libraryService.getBookByBarcode(tenantId, barcode);
      expect(book.title).toEqual('Physics I');
      expect(mockPrismaService.book.findUnique).toHaveBeenCalled();

      // Issue Book
      // Note: We need to mock the findUnique inside the transaction
      // Since we mock $transaction to just run the callback with the same mockPrismaService, it should work if we setup the mocks correctly on the main object.

      const transaction = await libraryService.issueBook(tenantId, barcode, studentId);

      expect(mockPrismaService.book.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: bookId },
        data: { availableCopies: 4 },
      }));

      expect(mockPrismaService.libraryTransaction.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          studentId,
          bookId,
          status: 'ISSUED',
        })
      }));
    });

    it('should throw error if book copies are zero', async () => {
       const tenantId = 'tenant-1';
      const barcode = 'ISBN-EMPTY';
      const studentId = 'student-1';

      mockPrismaService.book.findUnique.mockResolvedValue({
        id: 'book-2',
        availableCopies: 0,
      });

      await expect(libraryService.issueBook(tenantId, barcode, studentId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('Nurse Scenario', () => {
    it('should log OPD visit and trigger SOS alert', async () => {
      const tenantId = 'tenant-1';
      const studentId = 'student-1';
      const nurseId = 'nurse-1';
      const symptom = 'High Fever';

      mockPrismaService.opdVisit.create.mockResolvedValue({
        id: 'visit-1',
        studentId,
        symptom,
        visitTime: new Date(),
      });

      mockPrismaService.emergencyAlert.create.mockResolvedValue({
        id: 'alert-1',
        studentId,
        type: 'SOS',
        message: 'Emergency: High Fever',
        status: 'SENT',
      });

      // Log Visit
      await healthService.logOpdVisit(tenantId, studentId, symptom, undefined, nurseId);
      expect(mockPrismaService.opdVisit.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          studentId,
          symptom,
        })
      }));

      // Trigger SOS
      const alert = await healthService.triggerSos(tenantId, studentId, 'Emergency: High Fever');
      expect(alert.status).toEqual('SENT');
      expect(mockPrismaService.emergencyAlert.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          type: 'SOS',
          status: 'SENT',
        })
      }));
    });
  });
});
