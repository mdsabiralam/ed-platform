import { Test, TestingModule } from '@nestjs/testing';
import { SaasService } from './saas.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SaasService', () => {
  let service: SaasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaasService, PrismaService], // PrismaService এখানে যুক্ত করা হলো
    })
      .overrideProvider(PrismaService)
      .useValue({}) // PrismaService এর একটি ডামি ভার্সন দেওয়া হলো
      .compile();

    service = module.get<SaasService>(SaasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
