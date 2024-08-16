import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GroupMembers } from './entities/group-members.entity';
import { Role } from 'src/utils/enums';

@Injectable()
export class GroupMemberService {
  constructor(
    @InjectModel(GroupMembers)
    private groupMemberModel: typeof GroupMembers,
  ) {}
  async create(payload: {
    groupId: string;
    userId: string;
    role: Role;
  }): Promise<GroupMembers> {
    return this.groupMemberModel.create(payload);
  }

  async findOne(payload: {
    groupId: string;
    userId: string;
  }): Promise<GroupMembers | null> {
    return this.groupMemberModel.findOne({ where: payload });
  }

  async findAll(payload: { groupId: string }): Promise<GroupMembers[]> {
    return this.groupMemberModel.findAll({ where: payload });
  }
}
