import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GroupMessage } from './entities/group-message.entity';

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
}
