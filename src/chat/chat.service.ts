import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from './entities/message.entity';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PaginationFilters } from 'src/utils/types';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message)
    private messageModel: typeof Message,

    private readonly sequelize: Sequelize,
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
    messages: Message[];
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
      messages: rows,
      total: count,
      limit: limit,
      offset: offset,
    };
  }

  async getAllAddedUser(currentUserId: string, query: PaginationFilters) {
    const { offset = 0, limit = 10 } = query;

    const totalQuery = `
        SELECT COUNT(*) AS total_count
        FROM (
            SELECT id
            FROM (
                SELECT sender_id AS id
                FROM messages
                WHERE sender_id = '${currentUserId}'
                   OR receiver_id = '${currentUserId}'
                UNION
                SELECT receiver_id AS id
                FROM messages
                WHERE sender_id = '${currentUserId}'
                   OR receiver_id = '${currentUserId}'
            ) AS combined_ids
            WHERE id <> '${currentUserId}'
        ) AS total_results;
    `;

    const total = await this.sequelize.query(totalQuery, { plain: true });

    const usersQuery = `
        SELECT u.id, u.name, u.username, u.email, u.created_at, u.updated_at
        FROM (
            SELECT id
            FROM (
                SELECT sender_id AS id
                FROM messages
                WHERE sender_id = '${currentUserId}'
                   OR receiver_id = '${currentUserId}'
                UNION
                SELECT receiver_id AS id
                FROM messages
                WHERE sender_id = '${currentUserId}'
                   OR receiver_id = '${currentUserId}'
            ) AS combined_ids
            WHERE id <> '${currentUserId}'
            ORDER BY id
            LIMIT ${limit} OFFSET ${offset}
        ) AS ids
        JOIN users u ON ids.id = u.id;
    `;

    const users = await this.sequelize.query(usersQuery);

    return {
      users: users[0],
      total: typeof total?.total_count === 'string' ? +total.total_count : 0,
      offset,
      limit,
    };
  }
}
