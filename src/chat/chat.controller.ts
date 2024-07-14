import { Body, Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUser } from 'src/utils/decorators/current-user';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaginationFilters } from 'src/utils/types';

@Controller('chat')
export class ChatsController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAllAddedUser(
    @CurrentUser() currentUser: User,
    @Query() query: PaginationFilters,
  ) {
    return this.chatService.getAllAddedUser(currentUser.id, query);
  }

  @UseGuards(AuthGuard)
  @Get(':userId')
  async findMessagesBetweenUsers(
    @CurrentUser() currentUser: User,
    @Body() body: PaginationFilters,
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
