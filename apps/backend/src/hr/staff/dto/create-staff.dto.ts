import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  designation: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  dateOfJoining: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  panNumber?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  qualification?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isTeachingStaff?: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}
