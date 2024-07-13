import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { applicationConfig } from 'config';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    UsersModule,
    MailModule,
    JwtModule.register({
      secret: applicationConfig.jwt.secret,
      signOptions: {
        expiresIn: applicationConfig.jwt.expiresIn,
        issuer: applicationConfig.jwt.issuer,
        algorithm: applicationConfig.jwt.algorithm,
      },
    }),
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
