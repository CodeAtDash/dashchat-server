import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Message } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './services/chat.service';
import { CommonModule } from 'src/common/common.module';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ChatsController } from './controller/chat.controller';
import { Group } from './entities/group.entity';
import { GroupMembers } from './entities/group-members.entity';
import { GroupMessage } from './entities/group-message.entity';
import { GroupChatService } from './services/group-chat.service';
import { GroupService } from './services/group.service';
import { GroupController } from './controller/group.controller';
import { GroupChatsController } from './controller/group-chat.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Message, Group, GroupMembers, GroupMessage]),
    CommonModule,
    UsersModule,
  ],
  providers: [
    ChatGateway,
    ChatService,
    GroupService,
    GroupChatService,
    JwtService,
  ],
  controllers: [ChatsController, GroupController, GroupChatsController],
})
export class ChatModule {}
