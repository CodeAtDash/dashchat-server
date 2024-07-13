import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { UsersService } from './services/users.service';
import { CurrentUser } from 'src/utils/decorators/current-user';
import { User } from './entities/user.entity';
import { StartEmailVerificationDto } from './dto/start-email-verification.dto';
import {
  EmailAlreadyVerified,
  EmailBelongsToSomeoneElse,
  EmailEnteredNotExist,
  InvalidOtp,
  PleaseEnterDifferentPassword,
  Unauthorized,
} from 'src/utils/exceptions';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { applicationConfig } from 'config';
import { FinishEmailVerificationDto } from './dto/finish-email-verification.dto';
import { isNilOrEmpty, isPresent } from 'src/utils/helpers';
import { MailService } from 'src/mail/services/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/utils/decorators/public';
import { AuthGuard } from 'src/auth/auth.guard';

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
  async updateUser(
    @CurrentUser() currentUser: User,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(
      { name: body.name },
      { id: currentUser.id },
    );
  }

  @UseGuards(AuthGuard)
  @Post('start-email-verification')
  async startEmailVerification(
    @CurrentUser() currentUser: User,
    @Body() body: StartEmailVerificationDto,
  ) {
    const user = await this.usersService.findOne({
      email: body.email,
      isVerified: true,
    });

    if (user) {
      if (user.id === currentUser.id) {
        throw new EmailAlreadyVerified();
      } else {
        throw new EmailBelongsToSomeoneElse();
      }
    }

    const otp = customAlphabet('0123456789', 6)();
    const emailVerificationJwtToken = this.jwtService.sign(
      {
        email: body.email,
        userId: currentUser.id,
      },
      {
        secret: applicationConfig.jwt.secret,
        algorithm: applicationConfig.jwt.algorithm,
        issuer: applicationConfig.jwt.issuer,
        expiresIn: applicationConfig.jwt.emailTokenExpiresIn,
      },
    );

    await this.usersService.update(
      {
        otp,
        verificationToken: emailVerificationJwtToken,
      },
      { id: currentUser.id, email: body.email, isVerified: false },
    );

    await this.mailService.sendVerificationEmail(otp, body.email);

    return { verificationToken: emailVerificationJwtToken };
  }

  @UseGuards(AuthGuard)
  @Post('finish-email-verification')
  async finishEmailVerification(
    @CurrentUser() currentUser: User,
    @Body() body: FinishEmailVerificationDto,
  ) {
    const payload = this.jwtService.verify(body.verificationToken, {
      secret: applicationConfig.jwt.secret,
    });

    if (!(isPresent(payload.email) && payload.userId === currentUser.id)) {
      throw new Unauthorized();
    }

    const user = await this.usersService.findOne({
      email: payload.email,
      isVerified: true,
    });

    if (user) {
      if (user.id === currentUser.id) {
        throw new EmailAlreadyVerified();
      } else {
        throw new EmailBelongsToSomeoneElse();
      }
    }

    const [affectedCount] = await this.usersService.update(
      {
        otp: null,
        verificationToken: null,
        isVerified: true,
      },
      {
        id: currentUser.id,
        email: payload.email,
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

    const otp = customAlphabet('0123456789', 6)();
    const passwordResetVerificationToken = this.jwtService.sign(
      {
        email: user!.email,
      },
      {
        secret: applicationConfig.jwt.secret,
        algorithm: applicationConfig.jwt.algorithm,
        issuer: applicationConfig.jwt.issuer,
        expiresIn: applicationConfig.jwt.emailTokenExpiresIn,
      },
    );

    await Promise.all([
      this.usersService.update(
        {
          otp,
          verificationToken: passwordResetVerificationToken,
        },
        { id: user!.id },
      ),
      this.mailService.sendPasswordResetVerificationEmail(otp, user!.email),
    ]);

    return { verificationToken: passwordResetVerificationToken };
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
