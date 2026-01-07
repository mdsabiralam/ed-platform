import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImpersonateUserDto {
  @ApiProperty({ description: 'The ID of the user to impersonate' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  targetUserId: string;
}
