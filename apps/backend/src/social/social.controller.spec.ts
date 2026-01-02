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
    const result = await controller.getPublicArtifact('xyz123');
    expect(result).toEqual({
      firstName: 'Test',
      className: 'X',
      schoolName: 'Test School',
      rank: '1',
      percentage: '99%'
    });
    expect(service.getPublicArtifact).toHaveBeenCalledWith('xyz123');
  });
});
