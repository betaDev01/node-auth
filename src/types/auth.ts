import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class SignUpProps {
  @IsNotEmpty({ message: 'Email address is missing.' })
  @IsEmail(undefined, { message: 'Enter Valid Email Address.' })
  readonly email: string;

  @IsNotEmpty({ message: 'Phone Number address is missing.' })
  readonly phoneNumber: string;

  @IsNotEmpty({ message: 'Password is missing.' })
  @MinLength(5, {
    message: 'password is too short',
  })
  @MaxLength(20, {
    message: 'password is too long',
  })
  password: string;

  @IsNotEmpty({ message: 'Confirm Password is missing.' })
  @MinLength(5, {
    message: 'password is too short',
  })
  @MaxLength(20, {
    message: 'password is too long',
  })
  confirmPassword: string;

  @IsOptional()
  @IsBoolean()
  readonly isAdmin: boolean

}

export class LoginProps {
  @IsOptional()
  @ValidateIf(v => v.phoneNumber === '')
  @IsEmail({}, { message: 'Enter valid Email ID.' })
  email: string;

  @ValidateIf((v) => v.email === '')
  phoneNumber: string

  @ValidateIf(v => v.token === '')
  @IsNotEmpty({ message: 'Password is missing.' })
  password: string;

}


export class AttemptsProps {
  @IsNumber()
  readonly attemptsCount: number;

  @IsOptional()
  @IsNumber()
  readonly linkValidUpto?: number | null;
}

export class GenerateTempProps {
  @IsOptional()
  @ValidateIf(v => v.phoneNumber === '')
  @IsEmail({}, { message: 'Enter valid Email ID.' })
  email: string;

  @ValidateIf((v) => v.email === '')
  phoneNumber: string
}


export class ValidateToken{
  @IsString()
  readonly token: string
}