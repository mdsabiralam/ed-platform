
import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SocialService } from './social.service';

@ApiTags('Social Branding')
@Controller('api/social')
export class SocialController {
    constructor(private readonly socialService: SocialService) {}

    @Post('share/create-link')
    @ApiOperation({ summary: 'Create a public share link for a student result' })
    createShareLink(@Body() body: { studentId: string }) {
        return { url: this.socialService.createShareLink(body.studentId) };
    }

    @Get('public/:slug')
    @ApiOperation({ summary: 'Get public artifact by slug' })
    getPublicArtifact(@Param('slug') slug: string) {
        return { type: 'RESULT', url: '...' };
    }
}
