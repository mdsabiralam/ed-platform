import { IsString, IsEnum, IsOptional } from 'class-validator';

export class WebhookLogisticsDto {
  @IsString()
  orderId: string;

  @IsString()
  status: string; // SHIPPED, DELIVERED, etc.

  @IsOptional()
  @IsString()
  trackingNo?: string;

  @IsOptional()
  @IsString()
  courierPartner?: string;
}
