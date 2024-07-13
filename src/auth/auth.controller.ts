import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/utils/decorators/public';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { isNilOrEmpty } from 'src/utils/helpers';
import { InvalidArguments } from 'src/utils/exceptions';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    if (isNilOrEmpty(loginDto.email)) {
      throw new InvalidArguments();
    }

    return this.authService.login(loginDto);
  }
}
