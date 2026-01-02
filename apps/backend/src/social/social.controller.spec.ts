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
    expect(res.set).toHaveBeenCalledWith({
      'Content-Type': 'image/png',
      'Content-Length': 10,
    });
    expect(res.send).toHaveBeenCalled();
  });
});
