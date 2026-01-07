import { IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BroadcastFilterDto } from './broadcast-filter.dto';
import { BroadcastChannel } from '@prisma/client';

export class CreateCampaignDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  messageBody: string;

  @IsEnum(BroadcastChannel)
  channel: BroadcastChannel;

  @ValidateNested()
  @Type(() => BroadcastFilterDto)
  filter: BroadcastFilterDto;
}
