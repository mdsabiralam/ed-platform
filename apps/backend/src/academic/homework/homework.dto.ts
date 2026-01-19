import { IsString, IsDateString, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class AttachmentDto {
    @IsString()
    type: 'PDF' | 'YOUTUBE';

    @IsString()
    url: string;
}

export class CreateHomeworkDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  sectionId: string;

  @IsDateString()
  deadline: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments: AttachmentDto[];
}
