import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import { RegisterDto } from './dto/register.dto';
import { isPresent } from 'src/utils/helpers';
import {
  DuplicateEmail,
  Unauthorized,
  WrongPassword,
} from 'src/utils/exceptions';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import { applicationConfig } from 'config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async generateJwt(user: User) {
    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
      expires_in: applicationConfig.jwt.expiresIn,
    };
  }

  async register(registerDto: RegisterDto) {
    const isEmailAlreadyTaken = isPresent(
      await this.usersService.findOne({
        email: registerDto.email,
        isVerified: true,
      }),
    );

    if (isEmailAlreadyTaken) {
      throw new DuplicateEmail();
    }

    const user = await this.usersService.create(registerDto);

    return {
      user,
      ...(await this.generateJwt(user)),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOne({
      email: loginDto.email,
      isVerified: true,
    });

    if (!user) {
      throw new Unauthorized();
    }

    const isMatch = await this.usersService.verifyPassword({
      id: user.id,
      password: loginDto.password,
    });

    if (!isMatch) {
      throw new WrongPassword();
    }

    return {
      user,
      ...(await this.generateJwt(user)),
    };
  }
}
