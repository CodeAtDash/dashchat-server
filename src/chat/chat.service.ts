import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from './entities/message.entity';
import { Op } from 'sequelize';
import { ChatQueryDto } from './dto/chat-query.dto';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message)
    private messageModel: typeof Message,

    private readonly userService: UsersService,
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
    offset: number = 0,
    limit: number = 10,
  ): Promise<{
    data: Message[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { count, rows } = await this.messageModel.findAndCountAll({
      where: {
        [Op.or]: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      data: rows,
      total: count,
      limit: limit,
      offset: offset,
    };
  }

  async getAllUserChats(currentUserId: string, query: ChatQueryDto) {
    const { offset = 0, limit = 10, search } = query;

    const messages = await this.messageModel.findAll({
      where: {
        [Op.or]: [{ senderId: currentUserId }, { receiverId: currentUserId }],
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const userIds = Array.from(
      new Set(
        messages.map((message) =>
          message.senderId === currentUserId
            ? message.receiverId
            : message.senderId,
        ),
      ),
    );

    const userWhere: any = {
      id: {
        [Op.in]: userIds,
      },
    };

    if (search) {
      userWhere.name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const users = await this.userService.findAll({
      where: userWhere,
      attributes: ['id', 'name', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    return {
      data: users,
      offset,
      limit,
    };
  }
}
