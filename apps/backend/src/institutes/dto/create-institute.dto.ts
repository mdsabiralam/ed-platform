import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateInstituteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Subdomain must be lowercase alphanumeric with hyphens' })
  subdomain: string;
}
