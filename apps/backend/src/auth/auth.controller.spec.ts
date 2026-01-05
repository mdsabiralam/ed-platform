import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SwitchProfileDto } from './dto/switch-profile.dto';

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
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('switchProfile', () => {
    it('should call authService.switchProfile with correct parameters', async () => {
      const dto: SwitchProfileDto = { targetProfileId: 'profile-123' };
      const req = { user: { id: 'user-123' } };

      const result = { message: 'success', profileId: 'profile-123', userId: 'user-123' };

      jest.spyOn(authService, 'switchProfile').mockImplementation(async () => result);

      expect(await controller.switchProfile(req, dto)).toBe(result);
      expect(authService.switchProfile).toHaveBeenCalledWith('user-123', 'profile-123');
    });

    it('should use dummy user id if req.user is missing', async () => {
        const dto: SwitchProfileDto = { targetProfileId: 'profile-456' };
        const req = {}; // No user

        const result = { message: 'success', profileId: 'profile-456', userId: 'dummy-user-id' };

        jest.spyOn(authService, 'switchProfile').mockImplementation(async () => result);

        expect(await controller.switchProfile(req, dto)).toBe(result);
        expect(authService.switchProfile).toHaveBeenCalledWith('dummy-user-id', 'profile-456');
      });
  });
});
