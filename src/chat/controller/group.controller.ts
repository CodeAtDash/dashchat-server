import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GroupService } from '../services/group.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateGroupDto } from '../dto/create-group.dto';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/utils/decorators/current-user';
import { AddGroupMemberDto } from '../dto/add-group-member.dto';
import { Role } from 'src/utils/enums';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createGroup(
    @CurrentUser() currentUser: User,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    try {
      return this.groupService.createGroup({
        name: createGroupDto.name,
        description: createGroupDto.description,
        userId: currentUser.id,
      });
    } catch (error) {
      console.error('Error in createGroup:', error);
    }
  }

  @UseGuards(AuthGuard)
  @Post('add-user')
  async addUserToGroup(
    @CurrentUser() currentUser: User,
    @Body() addGroupMemberDto: AddGroupMemberDto,
  ) {
    try {
      const isCurrentUserGroupAdmin =
        await this.groupService.findOneGroupMember({
          groupId: addGroupMemberDto.groupId,
          userId: currentUser.id,
          role: Role.ADMIN,
        });

      if (isCurrentUserGroupAdmin) {
        return this.groupService.createGroupMember({
          groupId: addGroupMemberDto.groupId,
          userId: addGroupMemberDto.userId,
        });
      }
    } catch (error) {
      console.error('Error in addUserToGroup:', error);
    }
  }
}
