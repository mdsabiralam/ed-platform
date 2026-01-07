import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl: string;
  private readonly jwtSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Default to localhost:8000 if not set
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
    this.jwtSecret = this.configService.get<string>('JWT_SECRET', 'secretKey');
  }

  private generateToken(): string {
    // Generate a service-to-service token or use a system user token
    return jwt.sign({ sub: 'system-backend', role: 'admin' }, this.jwtSecret, { expiresIn: '1h' });
  }

  async testConnection(): Promise<string> {
    const url = `${this.aiServiceUrl}/test-connection`;
    const payload = { data: 'Hello' };

    this.logger.log(`Testing connection to AI service at ${url}`);

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, payload).pipe(
          catchError((e) => {
            this.logger.error(`Failed to connect to AI service: ${e.message}`);
            throw new HttpException('AI Service unavailable', HttpStatus.BAD_GATEWAY);
          }),
        ),
      );

      this.logger.log(`Received response from AI service: ${JSON.stringify(response.data)}`);
      return response.data.message;
    } catch (error) {
        throw error;
    }
  }

  async processData(data: string): Promise<any> {
    const url = `${this.aiServiceUrl}/process`;
    const token = this.generateToken();

    try {
      const response = await lastValueFrom(
        this.httpService.post(
            url,
            { data },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ).pipe(
          catchError((e) => {
            this.logger.error(`Error processing data: ${e.message}`);
             throw new HttpException(e.response?.data || 'AI Service Error', e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        ),
      );
      return response.data;
    } catch (error) {
        throw error;
    }
  }
}
