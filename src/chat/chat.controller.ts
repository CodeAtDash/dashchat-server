import {
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUser } from 'src/utils/decorators/current-user';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaginationFilters } from 'src/utils/types';
import { UserIdCannotBeSameAsCurrentUserId } from 'src/utils/exceptions';

@Controller('chat')
export class ChatsController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAllAddedUser(
    @CurrentUser() currentUser: User,
    @Query() params: PaginationFilters,
  ) {
    try {
      return this.chatService.getAllAddedUser(currentUser.id, params);
    } catch (error) {
      throw new HttpException(
        'Failed to get users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get(':userId')
  async findMessagesBetweenUsers(
    @CurrentUser() currentUser: User,
    @Query() params: PaginationFilters,
    @Param('userId') userId: string,
  ) {
    try {
      const { offset, limit } = params;

      if (currentUser.id === userId) {
        throw new UserIdCannotBeSameAsCurrentUserId();
      }

      return this.chatService.findMessagesBetweenUsers(
        currentUser.id,
        userId,
        offset,
        limit,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to find messages between users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Put('read/:id')
  async markMessageAsRead(
    @CurrentUser() currentUser: User,
    @Param('id') id: string,
  ) {
    try {
      return this.chatService.update(
        {
          isRead: true,
        },
        { id, receiverId: currentUser.id },
      );
    } catch (error) {
      throw new HttpException(
        'Failed to mark message as read',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
