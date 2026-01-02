import { ApiProperty } from '@nestjs/swagger';

export class LagReportItemDto {
  @ApiProperty()
  subject: string;

  @ApiProperty()
  class: string;

  @ApiProperty()
  section: string;

  @ApiProperty()
  teacher: string;

  @ApiProperty()
  topic: string;

  @ApiProperty()
  targetDate: Date;

  @ApiProperty()
  completionDate: Date;

  @ApiProperty()
  lagDays: number;

  @ApiProperty({ required: false })
  suggestion?: string;
}
