import { Controller, Post, UploadedFile, UseInterceptors, Res, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiProxyService } from '../services/ai-proxy.service';
import { Response } from 'express';

@Controller('ai')
export class AiController {
  constructor(private readonly aiProxyService: AiProxyService) {}

  @Post('voice/command')
  @UseInterceptors(FileInterceptor('file'))
  async handleVoiceCommand(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    // Forward to Python AI Engine
    try {
      const result = await this.aiProxyService.forwardVoiceCommand(file);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error processing voice command', error: error.message });
    }
  }
}
