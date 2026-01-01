import { IsString, IsNotEmpty } from 'class-validator';

export class AssignDutyDto {
  @IsString()
  @IsNotEmpty()
  examScheduleId: string;

  @IsString()
  @IsNotEmpty()
  staffId: string;

  @IsString()
  @IsNotEmpty()
  roomId: string;
}
