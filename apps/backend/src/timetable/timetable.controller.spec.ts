import { Test, TestingModule } from '@nestjs/testing';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';

describe('TimetableController', () => {
  let controller: TimetableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimetableController],
      providers: [
        {
          provide: TimetableService,
          useValue: {
            validateRequest: jest.fn().mockResolvedValue({ status: 'valid', message: 'mock' }),
          },
        },
      ],
    }).compile();

    controller = module.get<TimetableController>(TimetableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
