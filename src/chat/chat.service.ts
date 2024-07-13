import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from './entities/message.entity';
import { Op } from 'sequelize';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message)
    private messageModel: typeof Message,
  ) {}

  async createMessage(
    senderId: string,
    receiverId: string,
    content: string,
  ): Promise<Message> {
    return this.messageModel.create({
      senderId,
      receiverId,
      content,
    });
  }

  async findMessagesBetweenUsers(
    userId1: string,
    userId2: string,
  ): Promise<Message[]> {
    return this.messageModel.findAll({
      where: {
        [Op.or]: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      order: [['createdAt', 'DSC']],
    });
  }
}
