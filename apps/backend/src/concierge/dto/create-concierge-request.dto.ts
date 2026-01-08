import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateConciergeRequestDto {
  @IsUrl()
  rawImageUrl: string;

  @IsString()
  @IsOptional()
  instructionText?: string;

  @IsUrl()
  @IsOptional()
  audioUrl?: string;
}
