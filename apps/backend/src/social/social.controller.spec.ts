import { Test, TestingModule } from '@nestjs/testing';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SocialController', () => {
  let controller: SocialController;
  let service: SocialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialController],
      providers: [
        {
          provide: SocialService,
          useValue: {
            generateStudentOgImage: jest.fn().mockResolvedValue(Buffer.from('fake-image')),
            createShareLink: jest.fn().mockResolvedValue('http://localhost:3000/r/xyz123'),
            getPublicArtifact: jest.fn().mockResolvedValue({
              firstName: 'Test',
              className: 'X',
              schoolName: 'Test School',
              rank: '1',
              percentage: '99%'
            }),
            handleAdmissionCta: jest.fn().mockResolvedValue('https://edplatform.com/admissions/apply'),
            getKFactorAnalytics: jest.fn().mockResolvedValue({
              kFactor: 1.5,
              totalShares: 10,
              totalClicks: 15,
              platformBreakdown: []
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SocialController>(SocialController);
    service = module.get<SocialService>(SocialService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an image buffer', async () => {
    const res = {
      set: jest.fn(),
      send: jest.fn(),
    };

    await controller.generateOgImage('123', res as any);

    expect(service.generateStudentOgImage).toHaveBeenCalledWith('123');
  });

  it('should create a share link', async () => {
    const result = await controller.createShareLink({ studentId: '1', examId: '2' });
    expect(result).toEqual({ url: 'http://localhost:3000/r/xyz123' });
    expect(service.createShareLink).toHaveBeenCalledWith('1', '2');
  });

  it('should get public artifact', async () => {
    const result = await controller.getPublicArtifact('xyz123', 'Mozilla/5.0');
    expect(result).toEqual({
      firstName: 'Test',
      className: 'X',
      schoolName: 'Test School',
      rank: '1',
      percentage: '99%'
    });
    expect(service.getPublicArtifact).toHaveBeenCalledWith('xyz123', 'Mozilla/5.0');
  });

  it('should get k-factor analytics', async () => {
    const result = await controller.getKFactor();
    expect(result).toEqual({
      kFactor: 1.5,
      totalShares: 10,
      totalClicks: 15,
      platformBreakdown: []
    });
    expect(service.getKFactorAnalytics).toHaveBeenCalled();
  });

  it('should handle admission CTA redirect', async () => {
    const res = { redirect: jest.fn() };
    await controller.handleAdmissionCta('xyz123', res as any);
    expect(service.handleAdmissionCta).toHaveBeenCalledWith('xyz123');
    expect(res.redirect).toHaveBeenCalledWith('https://edplatform.com/admissions/apply');
  });
});
