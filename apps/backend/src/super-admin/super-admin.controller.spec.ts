import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { ImpersonateUserDto } from './dto/impersonate-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

describe('SuperAdminController', () => {
  let controller: SuperAdminController;
  let service: SuperAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperAdminController],
      providers: [
        {
          provide: SuperAdminService,
          useValue: {
            impersonateUser: jest.fn(),
          },
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<SuperAdminController>(SuperAdminController);
    service = module.get<SuperAdminService>(SuperAdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('impersonate', () => {
    it('should call service.impersonateUser with targetUserId', async () => {
      const dto: ImpersonateUserDto = { targetUserId: 'target-user-id' };
      const tokens = { accessToken: 'access', refreshToken: 'refresh' };

      jest.spyOn(service, 'impersonateUser').mockResolvedValue(tokens);

      const result = await controller.impersonate(dto);

      expect(result).toEqual(tokens);
      expect(service.impersonateUser).toHaveBeenCalledWith('target-user-id');
    });
  });
});
