import { Body, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUser } from 'src/utils/decorators/current-user';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { ChatQueryDto } from './dto/chat-query.dto';
import { FindMessagesDto } from './dto/message.dto';

@Controller('chat')
export class ChatsController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAllAddedUser(
    @CurrentUser() currentUser: User,
    @Body() body: ChatQueryDto,
  ) {
    return this.chatService.getAllAddedUser(currentUser.id, body);
  }

  @UseGuards(AuthGuard)
  @Get('user/:userId')
  async findMessagesBetweenUsers(
    @CurrentUser() currentUser: User,
    @Body() body: FindMessagesDto,
    @Param('userId') userId: string,
  ) {
    const { offset, limit } = body;

    return this.chatService.findMessagesBetweenUsers(
      currentUser.id,
      userId,
      offset,
      limit,
    );
  }
}
