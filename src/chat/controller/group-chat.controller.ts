import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GroupChatService } from '../services/group-chat.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/utils/decorators/current-user';
import { User } from 'src/users/entities/user.entity';
import { PaginationFilters } from 'src/utils/types';
import { GroupService } from '../services/group.service';
import { CurrentUserIsNotMember } from 'src/utils/exceptions';

@Controller('group-chat')
export class GroupChatsController {
  constructor(
    private readonly groupChatService: GroupChatService,
    private readonly groupService: GroupService,
  ) {}

  @UseGuards(AuthGuard)
  @Get(':groupId')
  async findMessagesBetweenUsers(
    @CurrentUser() currentUser: User,
    @Query() params: PaginationFilters,
    @Param('groupId') groupId: string,
  ) {
    try {
      const { offset, limit } = params;

      const membership = await this.groupService.findOneGroupMember({
        groupId,
        userId: currentUser.id,
      });

      if (!membership) {
        throw new CurrentUserIsNotMember();
      }

      return this.groupChatService.findAll(groupId, offset, limit);
    } catch (error) {
      console.error('Error in findMessagesBetweenUsers:', error);
    }
  }
}
