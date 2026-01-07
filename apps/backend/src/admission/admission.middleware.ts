import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AgeValidationMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'POST' && req.baseUrl.includes('/admission/apply')) {
        const { date_of_birth, class_id } = req.body;

        if (date_of_birth && class_id) {
            // Fetch admission config/class details
            // 4.B.08: Fetch admission_config for age limits
            // Assuming config is stored in GlobalConfig or environment or mock it.
            // Using ConfigService to mimic fetching from config source (or environment variable overrides)

            const minAge = this.configService.get<number>('ADMISSION_MIN_AGE') || 3;
            const maxAge = this.configService.get<number>('ADMISSION_MAX_AGE') || 20;

            const dob = new Date(date_of_birth);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            if (age < minAge || age > maxAge) {
                 throw new BadRequestException(`Student age ${age} is not valid for admission (allowed: ${minAge}-${maxAge}).`);
            }
        }
    }
    next();
  }
}
