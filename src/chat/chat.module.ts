import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Message } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [SequelizeModule.forFeature([Message]),CommonModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
