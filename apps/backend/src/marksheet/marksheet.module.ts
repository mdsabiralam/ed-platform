import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MarksheetProcessor } from './marksheet.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'marksheet_generation',
    }),
  ],
  providers: [MarksheetProcessor],
  exports: [BullModule],
})
export class MarksheetModule {}
