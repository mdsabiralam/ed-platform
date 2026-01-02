import { Controller, Get, Param, Res } from '@nestjs/common';
import { SocialService } from './social.service';
import type { Response } from 'express';

@Controller('api/social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('og-image/:studentId')
  async generateOgImage(
    @Param('studentId') studentId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.socialService.generateStudentOgImage(studentId);

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
