import { IsEnum, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';
import { BroadcastChannel } from '@prisma/client';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  messageBody: string;

  @IsEnum(BroadcastChannel)
  channel: BroadcastChannel;

  @IsObject()
  targetFilter: any; // { classId?: string, defaultersOnly?: boolean }
}

export class EstimateCostDto {
  @IsObject()
  targetFilter: any;

  @IsString()
  @IsNotEmpty()
  messageBody: string;

  @IsEnum(BroadcastChannel)
  channel: BroadcastChannel;
}
