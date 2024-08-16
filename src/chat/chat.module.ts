import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Message } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { CommonModule } from 'src/common/common.module';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ChatsController } from './chat.controller';
import { Group } from './entities/group.entity';
import { GroupMembers } from './entities/group-members.entity';
import { GroupMessage } from './entities/group-message.entity';
import { GroupChatService } from './group-chat.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Message, Group, GroupMembers, GroupMessage]),
    CommonModule,
    UsersModule,
  ],
  providers: [ChatGateway, ChatService, GroupChatService, JwtService],
  controllers: [ChatsController],
})
export class ChatModule {}
