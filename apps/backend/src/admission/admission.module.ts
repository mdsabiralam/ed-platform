import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AdmissionController } from './admission.controller';
import { StudentApplicationService } from './student-application.service';
import { FileUploadService } from './file-upload.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AgeValidationMiddleware } from './admission.middleware';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AdmissionController],
  providers: [StudentApplicationService, FileUploadService],
})
export class AdmissionModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
          .apply(AgeValidationMiddleware)
          .forRoutes({ path: 'admission/apply', method: RequestMethod.POST });
      }
}
