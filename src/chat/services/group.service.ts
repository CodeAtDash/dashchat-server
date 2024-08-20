import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Group } from '../entities/group.entity';
import { GroupMembers } from '../entities/group-members.entity';
import { Role } from 'src/utils/enums';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group)
    private groupModel: typeof Group,

    @InjectModel(GroupMembers)
    private groupMemberModel: typeof GroupMembers,
  ) {}
  async createGroup(payload: {
    name: string;
    description: string;
    userId: string;
  }): Promise<Group> {
    const group = await this.groupModel.create({
      name: payload.name,
      description: payload.description,
    });

    await this.groupMemberModel.create({
      groupId: group.id,
      userId: payload.userId,
      role: Role.ADMIN,
    });

    return group;
  }

  async createGroupMember(payload: { groupId: string; userId: string }) {
    return this.groupMemberModel.create({ ...payload, role: Role.MEMBER });
  }

  async findOneGroupMember(payload: {
    groupId: string;
    userId: string;
    role?: Role;
  }): Promise<GroupMembers | null> {
    return this.groupMemberModel.findOne({ where: payload });
  }

  async findAllGroupMember(payload: {
    groupId: string;
  }): Promise<GroupMembers[]> {
    return this.groupMemberModel.findAll({ where: payload });
  }
}
