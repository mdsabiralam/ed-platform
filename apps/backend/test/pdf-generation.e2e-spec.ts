import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AdminService } from '../src/admin/admin.service';
import { PdfService } from '../src/shared/pdf/pdf.service';
const pdfParse = require('pdf-parse');

// Mock Prisma Service
const mockPrismaService = {
  student: {
    findUnique: jest.fn().mockImplementation(({ where }) => {
      if (where.id === '123') {
        return Promise.resolve({
          id: '123',
          firstName: 'John',
          lastName: 'Doe',
          admissionNo: '12345',
          dob: new Date('2010-01-01'),
          address: '123 Test St',
          photoUrl: 'http://example.com/photo.jpg',
          section: {
            name: 'A',
            class: {
              name: 'Class 10'
            }
          }
        });
      }
      return Promise.resolve(null);
    }),
    findMany: jest.fn().mockImplementation(({ where }) => {
      if (where.section?.classId === 'class123') {
        return Promise.resolve([
          {
            id: '123',
            firstName: 'John',
            lastName: 'Doe',
            admissionNo: '12345',
            dob: new Date('2010-01-01'),
            address: '123 Test St',
            photoUrl: 'http://example.com/photo.jpg',
            section: {
              name: 'A',
              class: {
                name: 'Class 10'
              }
            }
          },
          {
            id: '124',
            firstName: 'Jane',
            lastName: 'Doe',
            admissionNo: '12346',
            dob: new Date('2010-02-01'),
            address: '124 Test St',
            photoUrl: 'http://example.com/photo2.jpg',
            section: {
              name: 'A',
              class: {
                name: 'Class 10'
              }
            }
          }
        ]);
      }
      return Promise.resolve([]);
    }),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $use: jest.fn(),
};

describe('PdfGeneration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(PrismaService)
    .useValue(mockPrismaService)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/admin/generate-id/:studentId (POST) should return PDF with correct content', async () => {
    jest.setTimeout(30000); // Increase timeout for Puppeteer
    // @ts-ignore
    const response = await request.default(app.getHttpServer())
      .post(`/api/admin/generate-id/123`)
      .expect(201);

    expect(response.headers['content-type']).toBe('application/pdf');
    expect(response.body).toBeInstanceOf(Buffer);
    expect(response.body.length).toBeGreaterThan(0);

    // Check PDF content
    const data = await pdfParse(response.body);
    expect(data.text).toContain('John Doe');
    expect(data.text).toContain('Class 10 - A');
  });

  it('/api/admin/generate-id/batch/:classId (POST) should return PDF with correct content', async () => {
    jest.setTimeout(30000); // Increase timeout for Puppeteer
    // @ts-ignore
    const response = await request.default(app.getHttpServer())
      .post(`/api/admin/generate-id/batch/class123`)
      .expect(201);

    expect(response.headers['content-type']).toBe('application/pdf');
    expect(response.body).toBeInstanceOf(Buffer);
    expect(response.body.length).toBeGreaterThan(0);

    // Check PDF content
    const data = await pdfParse(response.body);
    expect(data.text).toContain('John Doe');
    expect(data.text).toContain('Jane Doe');
    expect(data.numpages).toBeGreaterThanOrEqual(2);
  });
});
