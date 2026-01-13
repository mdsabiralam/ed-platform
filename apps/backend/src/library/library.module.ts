import { Module } from '@nestjs/common';
import { LibraryService } from './library.service';
import { ResultModule } from '../academic/results/result.module';

@Module({
  imports: [ResultModule],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}
