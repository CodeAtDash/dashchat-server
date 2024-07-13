import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { CurrentUser } from 'src/utils/decorators/current-user';
import { User } from './entities/user.entity';
import {
  EmailEnteredNotExist,
  InvalidOtp,
  PleaseEnterDifferentPassword,
  Unauthorized,
} from 'src/utils/exceptions';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { applicationConfig } from 'config';
import {
  generateOtpAndVerificationToken,
  isNilOrEmpty,
  isPresent,
} from 'src/utils/helpers';
import { MailService } from 'src/mail/services/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Public } from 'src/utils/decorators/public';
import { AuthGuard } from 'src/auth/auth.guard';
import { RegistrationFinalizeDto } from 'src/auth/dto/register.dto';

@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Patch()
  async updateUser(@CurrentUser() currentUser: User, @Body() body: any) {
    return this.usersService.update(
      { name: body.name },
      { id: currentUser.id },
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Put('register')
  async registrationFinalize(@Body() body: RegistrationFinalizeDto) {
    const payload = this.jwtService.verify(body.verificationToken, {
      secret: applicationConfig.jwt.secret,
    });

    if (!(isPresent(payload.email) && isPresent(payload.username))) {
      throw new Unauthorized();
    }

    const user = await this.usersService.findOne({
      email: payload.email,
      username: payload.username,
      isVerified: true,
    });

    const [affectedCount] = await this.usersService.update(
      {
        otp: null,
        verificationToken: null,
        isVerified: true,
      },
      {
        email: payload.email,
        username: payload.username,
        otp: body.otp,
        verificationToken: body.verificationToken,
        isVerified: false,
      },
    );

    if (affectedCount !== 1) {
      throw new InvalidOtp();
    }

    return { isVerified: true };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const user = await this.usersService.findOne({
      email: body.email,
      isVerified: true,
    });

    if (isNilOrEmpty(user)) {
      throw new EmailEnteredNotExist();
    }

    const { otp, verificationToken } = generateOtpAndVerificationToken(
      {
        email: body.email,
      },
      this.jwtService,
    );

    await Promise.all([
      this.usersService.update(
        {
          otp,
          verificationToken,
        },
        { id: user!.id },
      ),
      this.mailService.sendPasswordResetVerificationEmail(otp, user!.email),
    ]);

    return { verification_token: verificationToken };
  }

  @Public()
  @Post('update-password')
  async updatePassword(@Body() body: UpdatePasswordDto) {
    const payload = this.jwtService.verify(body.verificationToken, {
      secret: applicationConfig.jwt.secret,
    });
    if (isNilOrEmpty(payload.email)) {
      throw new Unauthorized();
    }

    const user = await this.usersService.findOne({
      email: payload.email,
      isVerified: true,
    });

    if (isNilOrEmpty(user)) {
      throw new Unauthorized();
    }

    const isMatch = await this.usersService.verifyPassword({
      email: payload.email,
      password: body.password,
    });

    if (isMatch) {
      throw new PleaseEnterDifferentPassword();
    }

    const saltOrRounds = 10;

    const hash = await bcrypt.hash(body.password, saltOrRounds);

    const [affectedCount] = await this.usersService.update(
      { password: hash, otp: null, verificationToken: null },
      {
        email: payload.email,
        otp: body.otp,
        verificationToken: body.verificationToken,
      },
    );

    if (affectedCount !== 1) {
      throw new InvalidOtp();
    }

    return { isChanged: true };
  }
}
