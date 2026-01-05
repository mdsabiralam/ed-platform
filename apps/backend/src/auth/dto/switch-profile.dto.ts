import { IsNotEmpty, IsString } from 'class-validator';

export class SwitchProfileDto {
  @IsNotEmpty()
  @IsString()
  targetProfileId: string;
}
