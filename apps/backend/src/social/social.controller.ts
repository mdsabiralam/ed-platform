import { Controller, Get, Param, Res, Post, Body, Query } from '@nestjs/common';
import { SocialService } from './social.service';
import type { Response } from 'express';

@Controller('api/social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('share/create-link')
  async createShareLink(@Body() body: { studentId: string; examId: string }) {
    const url = await this.socialService.createShareLink(body.studentId, body.examId);
    return { url };
  }

  @Get('public/:slug')
  async getPublicArtifact(@Param('slug') slug: string) {
    return this.socialService.getPublicArtifact(slug);
  }

  @Get('cta/admissions')
  async handleAdmissionCta(@Query('slug') slug: string, @Res() res: Response) {
    const url = await this.socialService.handleAdmissionCta(slug);
    res.redirect(url);
  }

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
