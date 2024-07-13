import {
  IsJWT,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdatePasswordDto {
  @IsJWT()
  verificationToken: string;

  @IsString()
  @MaxLength(6)
  @MinLength(6)
  otp: string;

  @MinLength(8)
  @MaxLength(30)
  @IsNotEmpty()
  password: string;
}
