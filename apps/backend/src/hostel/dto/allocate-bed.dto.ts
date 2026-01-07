import { IsString } from 'class-validator';

export class AllocateBedDto {
  @IsString()
  roomId: string;

  @IsString()
  bedNumber: string;

  @IsString()
  studentId: string;
}
