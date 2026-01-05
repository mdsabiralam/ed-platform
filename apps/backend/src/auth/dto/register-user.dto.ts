import { IsEmail, IsUUID, Matches, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail({}, { message: 'Email must be a valid email format' })
  email: string;

  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*[\W_]).{8,}$/, {
    message: 'Password must contain at least 1 uppercase letter and 1 symbol',
  })
  password: string;

  @IsUUID('4', { message: 'instituteId must be a valid UUID' })
  instituteId: string;
}
