import {
  IsJWT,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  OTP_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from 'src/utils/constants';

export class UpdatePasswordDto {
  @IsJWT()
  verificationToken: string;

  @IsString()
  @MaxLength(OTP_LENGTH)
  @MinLength(OTP_LENGTH)
  otp: string;

  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @IsNotEmpty()
  password: string;
}
