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
    const { offset = 0, limit = 10, search = '' } = query;

    // Query to get total count
    const totalQuery = `
        SELECT COUNT(*) AS total_count FROM (
            SELECT u.id, u.name, u.username, u.email, ranked_ids.content AS content,ranked_ids.created_at AS time
        FROM (
            SELECT id, content, created_at,
                   ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at DESC) AS rn
            FROM (
                SELECT sender_id AS id, content, created_at
                FROM messages
                WHERE sender_id = '${currentUserId}'
                   OR receiver_id = '${currentUserId}'
                UNION
                SELECT receiver_id AS id, content, created_at
                FROM messages
                WHERE sender_id = '${currentUserId}'
                   OR receiver_id = '${currentUserId}'
            ) AS combined_ids
            WHERE id <> '${currentUserId}'
        ) AS ranked_ids
        JOIN users u ON ranked_ids.id = u.id
        WHERE rn = 1 AND name ILIKE '%${search}%'
        ORDER BY ranked_ids.created_at DESC, u.id
        ) AS total_results;
    `;

    // Query to fetch paginated users
    const usersQuery = `
        SELECT u.id, u.name, u.username, u.email, ranked_ids.content AS content,ranked_ids.created_at AS time
        FROM (
            SELECT id, content, created_at,
                   ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at DESC) AS rn
            FROM (
                SELECT sender_id AS id, content, created_at
                FROM messages
                WHERE sender_id = '${currentUserId}'
                   OR receiver_id = '${currentUserId}'
                UNION
                SELECT receiver_id AS id, content, created_at
                FROM messages
                WHERE sender_id = '${currentUserId}'
                   OR receiver_id = '${currentUserId}'
            ) AS combined_ids
            WHERE id <> '${currentUserId}'
        ) AS ranked_ids
        JOIN users u ON ranked_ids.id = u.id
        WHERE rn = 1 AND name ILIKE '%${search}%'
        ORDER BY ranked_ids.created_at DESC, u.id
        LIMIT ${limit} OFFSET ${offset};
    `;

    try {
      const totalResult = await this.sequelize.query(totalQuery, {
        plain: true,
      });
      const usersResult = await this.sequelize.query(usersQuery);

      const total =
        typeof totalResult?.total_count === 'string'
          ? +totalResult.total_count
          : 0;

      return {
        users: usersResult[0],
        total,
        offset,
        limit,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
}
