
import { IsString, IsNotEmpty } from 'class-validator';

export class WhatsAppConfig {
  @IsString()
  @IsNotEmpty()
  WHATSAPP_ACCESS_TOKEN: string;

  @IsString()
  @IsNotEmpty()
  WHATSAPP_PHONE_NUMBER_ID: string;

  @IsString()
  @IsNotEmpty()
  WHATSAPP_BUSINESS_ACCOUNT_ID: string;

  @IsString()
  @IsNotEmpty()
  WHATSAPP_VERIFY_TOKEN: string;
}
