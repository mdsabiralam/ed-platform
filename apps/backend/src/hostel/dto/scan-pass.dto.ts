import { IsString } from 'class-validator';

export class ScanGatePassDto {
  @IsString()
  qrCode: string;
}
