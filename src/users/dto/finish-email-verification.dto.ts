import { IsJWT, IsString, MaxLength, MinLength } from 'class-validator';

export class FinishEmailVerificationDto {
  @IsJWT()
  verificationToken: string;

  @IsString()
  @MaxLength(6)
  @MinLength(6)
  otp: string;
}
