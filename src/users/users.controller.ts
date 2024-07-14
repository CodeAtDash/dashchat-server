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
  EmailAlreadyVerified,
  EmailEnteredNotExist,
  InvalidOtp,
  PleaseEnterDifferentPassword,
  Unauthorized,
} from 'src/utils/exceptions';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { applicationConfig } from 'config';
import {
  generateJwt,
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
import { PaginationDto } from './dto/pagination.dto';

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
    @Body() body: { name: string },
  ) {
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

    if (!(isPresent(payload.id) && isPresent(payload.username))) {
      throw new Unauthorized();
    }

    const user = await this.usersService.findOne({
      id: payload.id,
      username: payload.username,
    });

    if (!isPresent(user)) {
      throw new Unauthorized();
    }

    if (user!.isVerified) {
      throw new EmailAlreadyVerified();
    }

    const updatedUser = await this.usersService.update(
      {
        otp: null,
        verificationToken: null,
        isVerified: true,
      },
      {
        id: payload.id,
        otp: body.otp,
        verificationToken: body.verificationToken,
        isVerified: false,
      },
    );

    if (!(updatedUser[0] === 1)) {
      throw new InvalidOtp();
    }

    return {
      isVerified: true,
      ...(await generateJwt(
        { id: user!.id, username: user!.username },
        this.jwtService,
      )),
    };
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
        id: user!.id,
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

    return { verificationToken };
  }

  @Public()
  @Post('update-password')
  async updatePassword(@Body() body: UpdatePasswordDto) {
    const payload = this.jwtService.verify(body.verificationToken, {
      secret: applicationConfig.jwt.secret,
    });
    if (isNilOrEmpty(payload.email) || isNilOrEmpty(payload.id)) {
      throw new Unauthorized();
    }

    const user = await this.usersService.findOne({
      id: payload.id,
      email: payload.email,
      isVerified: true,
    });

    if (isNilOrEmpty(user)) {
      throw new Unauthorized();
    }

    const isMatch = await this.usersService.verifyPassword({
      id: payload.id,
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
        id: payload.id,
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

  @UseGuards(AuthGuard)
  @Get()
  async getAllUsers(@Body() body: PaginationDto) {
    const { offset, limit, order, search } = body;

    return this.usersService.getAllUsers({ offset, limit, order, search });
  }
}
