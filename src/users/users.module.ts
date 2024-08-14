import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { MailModule } from 'src/mail/mail.module';
import { JwtService } from '@nestjs/jwt';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), MailModule, CommonModule],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
  exports: [UsersService],
})
export class UsersModule {}
