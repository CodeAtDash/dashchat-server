import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { RegistrationFinalizeDto } from 'src/auth/dto/register.dto';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from 'src/utils/constants';

export class UpdatePasswordDto extends RegistrationFinalizeDto {
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @IsNotEmpty()
  password: string;
}
