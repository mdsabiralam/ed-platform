import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SwitchProfileDto } from './dto/switch-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('switch-profile')
  @UseGuards(JwtAuthGuard)
  switchProfile(@Request() req: any, @Body() switchProfileDto: SwitchProfileDto) {
    // Assuming req.user is populated, or using a dummy if missing in this scaffold state
    const userId = req.user?.id || 'dummy-user-id';
    return this.authService.switchProfile(userId, switchProfileDto.targetProfileId);
  }
}
