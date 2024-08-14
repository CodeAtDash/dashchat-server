import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { InvalidKeyError } from 'src/utils/exceptions';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async setObject(key: string, value: any): Promise<void> {
    if (typeof key !== 'string') {
      throw new InvalidKeyError('Key must be a string');
    }
    const expirationInSeconds = 90 * 24 * 60 * 60; // 3 months approximated to 90 days
    await this.redis.set(key, JSON.stringify(value), 'EX', expirationInSeconds);
  }

  async getObject(key: string): Promise<any> {
    if (typeof key !== 'string') {
      throw new InvalidKeyError('Key must be a string');
    }

    try {
      const data = await this.redis.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      console.error('Error retrieving or parsing data from Redis:', error);
      throw new Error('Could not retrieve or parse data from Redis');
    }
  }
}
