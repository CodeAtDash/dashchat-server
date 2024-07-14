import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from './entities/message.entity';
import { Op } from 'sequelize';
import { ChatQueryDto } from './dto/chat-query.dto';
import { UsersService } from 'src/users/services/users.service';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message)
    private messageModel: typeof Message,

    private readonly sequelize: Sequelize,

    private readonly userService: UsersService,
  ) {}

  async createMessage(payload: {
    senderId: string;
    receiverId: string;
    content: string;
  }): Promise<Message> {
    return this.messageModel.create(payload);
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

  async getAllAddedUser(currentUserId: string, query: ChatQueryDto) {
    const { offset = 0, limit = 10, search } = query;

    const total = await this.sequelize.query(`SELECT COUNT(*) AS total_count
FROM (
    SELECT id
    FROM (
        SELECT sender_id AS id
        FROM messages
        WHERE sender_id = ${currentUserId}
           OR receiver_id = ${currentUserId}
        UNION
        SELECT receiver_id AS id
        FROM messages
        WHERE sender_id = ${currentUserId}
           OR receiver_id = ${currentUserId}
    ) AS combined_ids
    WHERE id <> ${currentUserId}
) AS total_results;`);

    const users = await this.sequelize
      .query(`SELECT u.id, u.name, u.username, u.email, u.created_at, updated_at
FROM (
    SELECT id
    FROM (
        SELECT sender_id AS id
        FROM messages
        WHERE sender_id = ${currentUserId}
           OR receiver_id = ${currentUserId}
        UNION
        SELECT receiver_id AS id
        FROM messages
        WHERE sender_id = ${currentUserId}
           OR receiver_id = ${currentUserId}
    ) AS combined_ids
    WHERE id <> ${currentUserId}
    ORDER BY id
    LIMIT ${limit} OFFSET ${offset}
) AS ids
JOIN users u ON ids.id = u.id;`);

    return {
      users: users,
      total,
      offset,
      limit,
    };
  }
}
