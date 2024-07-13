import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { SequelizeModule } from "@nestjs/sequelize";
import { Message } from "./entities/message.entity";

@Module({
  imports: [SequelizeModule.forFeature([Message])],
  providers: [ChatGateway],
})
export class ChatModule {}
