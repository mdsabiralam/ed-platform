import { IsString, IsNotEmpty, Matches, IsEmail } from 'class-validator';

export class CreateInstituteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, { message: 'Subdomain must be lowercase alphanumeric with hyphens, and cannot start or end with a hyphen' })
  subdomain: string;

  @IsString()
  @IsNotEmpty()
  adminName: string;

  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;
}
