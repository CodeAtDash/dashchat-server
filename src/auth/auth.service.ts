import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import {
  generateJwt,
  generateOtpAndVerificationToken,
} from 'src/utils/helpers';
import {
  DuplicateEmail,
  DuplicateUsername,
  Unauthorized,
  WrongPassword,
} from 'src/utils/exceptions';
import { LoginDto } from './dto/login.dto';
import { RegistrationInitializeDto } from './dto/register.dto';
import { MailService } from 'src/mail/services/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly mailService: MailService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegistrationInitializeDto) {
    const [existingUsername, existingEmail] = await Promise.all([
      this.usersService.findOne({
        username: registerDto.username,
        isVerified: true,
      }),
      this.usersService.findOne({ email: registerDto.email, isVerified: true }),
    ]);

    if (existingUsername) {
      throw new DuplicateUsername();
    }

    if (existingEmail) {
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

    const user = await this.usersService.create(registerDto);

    const { otp, verificationToken } = generateOtpAndVerificationToken(
      {
        id: user.id,
        username: user.username,
      },
      this.jwtService,
    );

    await Promise.all([
      this.mailService.sendVerificationEmail(otp, user.email),
      this.usersService.update({ otp, verificationToken }, { id: user.id }),
    ]);

    return {
      user,
      verificationToken,
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
      ...(await generateJwt(
        { id: user.id, username: user.username },
        this.jwtService,
      )),
    };
  }
}
