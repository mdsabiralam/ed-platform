import { Test, TestingModule } from '@nestjs/testing';
import { SaasController } from './saas.controller';
import { SaasService } from './saas.service';

describe('SaasController', () => {
  let controller: SaasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaasController],
      providers: [{ provide: SaasService, useValue: {} }], // SaasService এর একটি ডামি ভার্সন দেওয়া হলো
    }).compile();

    controller = module.get<SaasController>(SaasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
