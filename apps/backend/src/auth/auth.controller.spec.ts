import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SwitchProfileDto } from './dto/switch-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            switchProfile: jest.fn(),
          },
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('switchProfile', () => {
    it('should call authService.switchProfile with correct parameters', async () => {
      const dto: SwitchProfileDto = { targetProfileId: 'profile-123' };
      // req.user must have sub as per controller update
      const req = { user: { sub: 'user-123' } };

      const result = { accessToken: 'token', refreshToken: 'token' };

      jest.spyOn(authService, 'switchProfile').mockImplementation(async () => result);

      expect(await controller.switchProfile(req, dto)).toBe(result);
      expect(authService.switchProfile).toHaveBeenCalledWith('user-123', 'profile-123');
    });
  });
});
