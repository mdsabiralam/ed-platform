import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() req) {
    // Basic login without guard for now to keep it simple or implement LocalAuthGuard later
    // Check credentials manually if LocalGuard isn't set up, or use AuthService.
    const user = await this.authService.validateUser(req.email, req.password);
    if (!user) {
        throw new Error('Unauthorized');
    }
    return this.authService.login(user);
  }
}
