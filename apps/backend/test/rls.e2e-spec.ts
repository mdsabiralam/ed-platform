import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('RLS Policy Verification (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should enforce RLS and not return data without proper claims', async () => {
    // ১. কোনো ক্লেইম (Claims) ছাড়া কুয়েরি চালানো
    // RLS পলিসি অনুযায়ী, authenticated ইউজার না হলে কোনো টেন্যান্ট ডাটা পাওয়ার কথা না।
    // সেশন ভেরিয়েবল রিসেট করা হচ্ছে (যদি আগে থেকে কিছু সেট করা থাকে)
    await prisma.$executeRawUnsafe(`RESET ALL;`);

    // Tenants টেবিল চেক করা
    const tenants = await prisma.tenant.findMany();

    // যদি RLS ঠিক থাকে, তাহলে সাধারণ ইউজারের (anon) কোনো টেন্যান্ট দেখার কথা না।
    // তাই, tenants অ্যারে খালি (empty) হওয়া উচিত।
    expect(tenants).toHaveLength(0);
  });

  it('should allow setting session claims via raw SQL', async () => {
    // এই টেস্টটি নিশ্চিত করে যে আমরা RLS বাইপাস বা সিমুলেট করতে পারছি
    const result = await prisma.$executeRawUnsafe(
      `SET "request.jwt.claims" = '{"sub":"test-user", "role":"ADMIN"}'`,
    );
    expect(result).toBeDefined();
  });
});
