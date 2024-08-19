import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GroupMessage } from '../entities/group-message.entity';
import { User } from 'src/users/entities/user.entity';
import { Group } from '../entities/group.entity';

@Injectable()
export class GroupChatService {
  constructor(
    @InjectModel(GroupMessage)
    private groupMessageModel: typeof GroupMessage,
  ) {}
  async create(payload: {
    groupId: string;
    senderId: string;
    content: string;
  }): Promise<GroupMessage> {
    return this.groupMessageModel.create(payload);
  }

  async findAll(
    groupId: string,
    offset: number = 0,
    limit: number = 10,
  ): Promise<{
    messages: GroupMessage[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { count, rows } = await this.groupMessageModel.findAndCountAll({
      where: {
        groupId,
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'username'],
        },
      ],
    });

    return {
      messages: rows,
      total: count,
      limit,
      offset,
    };
  }
}
