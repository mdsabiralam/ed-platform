import { Controller } from '@nestjs/common';
import { OnlineExamService } from './online-exam.service';

@Controller('academic/online-exam')
export class OnlineExamController {
  constructor(private readonly onlineExamService: OnlineExamService) {}
}
