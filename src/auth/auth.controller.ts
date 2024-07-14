import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/utils/decorators/public';
import { LoginDto } from './dto/login.dto';
import { RegistrationInitializeDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  registrationInitialized(@Body() body: RegistrationInitializeDto) {
    return this.authService.register(body);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body: LoginDto) {
    // if (isNilOrEmpty(body.email) && isNilOrEmpty(body.username)) {
    //   throw new InvalidArguments();
    // }

    // if (isPresent(body.email) && isPresent(body.username)) {
    //   throw new InvalidArguments();
    // }

    return this.authService.login(body);
  }
}
