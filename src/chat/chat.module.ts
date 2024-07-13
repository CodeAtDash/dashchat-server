import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Message } from './entities/message.entity';

@Module({
  imports: [SequelizeModule.forFeature([Message])],
})
export class ChatModule {}
