import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PdfModule } from '../shared/pdf/pdf.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PdfModule, PrismaModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
