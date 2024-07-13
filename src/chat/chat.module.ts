import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Message } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { CommonModule } from 'src/common/common.module';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ChatsController } from './chat.controller';

@Module({
  imports: [SequelizeModule.forFeature([Message]), CommonModule, UsersModule],
  providers: [ChatGateway, ChatService, JwtService],
  controllers: [ChatsController],
})
export class ChatModule {}
