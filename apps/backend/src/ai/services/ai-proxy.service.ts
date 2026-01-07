import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class AiProxyService {
  private aiEngineUrl = 'http://localhost:8000'; // Default Python service port

  async forwardVoiceCommand(file: Express.Multer.File) {
    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);

    const response = await axios.post(`${this.aiEngineUrl}/ai/voice/command`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return response.data;
  }
}
