import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import { generateOtpAndVerificationToken, isPresent } from 'src/utils/helpers';
import {
  DuplicateEmail,
  DuplicateUsername,
  Unauthorized,
  WrongPassword,
} from 'src/utils/exceptions';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import { applicationConfig } from 'config';
import {
  RegistrationInitializeDto,
} from './dto/register.dto';
import { MailService } from 'src/mail/services/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly mailService: MailService,
    private jwtService: JwtService,
  ) {}

  async generateJwt(user: User) {
    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
      expires_in: applicationConfig.jwt.expiresIn,
    };
  }

  async register(registerDto: RegistrationInitializeDto) {
    const isUsernameAlreadyTaken = isPresent(
      await this.usersService.findOne({
        username: registerDto.username,
        isVerified: true,
      }),
    );

    if (isUsernameAlreadyTaken) {
      throw new DuplicateUsername();
    }

    const isEmailAlreadyTaken = isPresent(
      await this.usersService.findOne({
        email: registerDto.email,
        isVerified: true,
      }),
    );

    if (isEmailAlreadyTaken) {
      throw new DuplicateEmail();
    }

    const [usernameExist, emailExist] = await Promise.all([
      this.usersService.findOne({ username: registerDto.username }),
      this.usersService.findOne({ email: registerDto.email }),
    ]);

    await Promise.all([
      usernameExist &&
        this.usersService.remove({ username: registerDto.username }),
      emailExist && this.usersService.remove({ email: registerDto.email }),
    ]);

    const { otp, verificationToken } = generateOtpAndVerificationToken(
      {
        email: registerDto.email,
        username: registerDto.username,
      },
      this.jwtService,
    );

    await this.mailService.sendVerificationEmail(otp, registerDto.email);

    const user = await this.usersService.create({
      ...registerDto,
      otp,
      verificationToken,
    });

    return {
      user,
      ...(await this.generateJwt(user)),
      verification_token: verificationToken,
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
