import { Controller, Post, Body, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { SocialService } from './social.service';
import type { Response } from 'express';

@Controller('api/social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('share/create-link')
  async createLink(@Body() body: { studentId: string; examId?: string }) {
    const url = await this.socialService.createShareLink(body.studentId, body.examId);
    return { url };
  }

  @Get('og-image/:studentId')
  async getOgImage(@Param('studentId') studentId: string, @Res() res: Response) {
    const imageBuffer = await this.socialService.getOgImage(studentId);

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
    });

    return res.send(imageBuffer);
  }
}
