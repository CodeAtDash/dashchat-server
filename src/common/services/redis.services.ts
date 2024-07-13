import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { InvalidKeyError } from 'src/errors/redis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async setObject(
    key: string,
    value: any,
    expiryInSeconds?: number,
  ): Promise<void> {
    if (typeof key !== 'string') {
      throw new InvalidKeyError('Invalid Key');
    }

    try {
      const serializedValue = JSON.stringify(value);

      if (
        expiryInSeconds &&
        typeof expiryInSeconds === 'number' &&
        expiryInSeconds > 0
      ) {
        await this.redis.set(key, serializedValue, 'EX', expiryInSeconds);
      } else {
        await this.redis.set(key, serializedValue);
      }
    } catch (error: any) {
      throw new Error(`Failed to set Redis key "${key}": ${error.message}`);
    }
  }

  async getObject(key: string): Promise<any> {
    if (typeof key !== 'string') {
      throw new InvalidKeyError('Invalid Key');
    }

    try {
      const data = await this.redis.get(key);

      if (!data) {
        return {};
      }

      return JSON.parse(data);
    } catch (error: any) {
      throw new Error(`Failed to get Redis key "${key}": ${error.message}`);
    }
  }
}
