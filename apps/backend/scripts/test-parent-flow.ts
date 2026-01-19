
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { FeesService } from '../src/fees/fees.service';
import { TransportService } from '../src/transport/transport.service';
import { ParentService } from '../src/parent/parent.service';
import { PrismaService } from '../src/prisma/prisma.service';

async function runTest() {
  const mockPrismaService = {
    guardian: {
      findUnique: () => Promise.resolve({
        students: [
          {
            student: {
              id: 'stu-1',
              firstName: 'Child',
              lastName: 'A',
              admissionNo: '1001',
              section: { name: 'A', class: { name: 'Class 5' } }
            }
          }
        ]
      }),
    },
    studentFee: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve({ id: 'fee-1', status: 'PENDING' }),
      update: (args) => Promise.resolve({ ...args.data, id: args.where.id, status: 'PAID' }),
    },
    vehicleLocation: {
      findFirst: () => Promise.resolve({ latitude: 23.0, longitude: 90.0 }),
    }
  };

  // We mock other potential DB users if necessary, but these should cover our specific services
  // If AppModule imports modules that use Prisma immediately on init, we might need more mocks.
  // But usually onModuleInit connects. Since we override the provider, the real connect won't happen
  // IF we mock the connect method too.

  (mockPrismaService as any).onModuleInit = async () => {};
  (mockPrismaService as any).onModuleDestroy = async () => {};
  (mockPrismaService as any).$connect = async () => {};
  (mockPrismaService as any).$disconnect = async () => {};

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
  .overrideProvider(PrismaService)
  .useValue(mockPrismaService)
  .compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  const parentService = app.get(ParentService);
  const feesService = app.get(FeesService);
  const transportService = app.get(TransportService);

  console.log('--- Testing Parent Flow (with Mock DB) ---');

  // 1. Sibling Switch
  try {
    console.log('Testing Sibling Switch...');
    const children = await parentService.getChildren('mock-user-id');
    console.log('Children fetched:', JSON.stringify(children, null, 2));
  } catch (e) {
    console.error('Error fetching children:', e);
  }

  // 2. Fee Payment
  try {
    console.log('Testing Fee Payment...');
    const res = await feesService.payFee('fee-1', 'CREDIT_CARD');
    console.log('Fee paid result:', res);
  } catch (e) {
    console.log('Fee payment error:', e.message);
  }

  // 3. Live Tracking
  try {
    console.log('Testing Live Tracking...');
    const location = await transportService.getLiveLocation('mock-vehicle-id');
    console.log('Live location fetched:', location);
  } catch (e) {
    console.error('Error fetching location:', e);
  }

  await app.close();
}

runTest();
