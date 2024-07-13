import { Module } from '@nestjs/common';
import { RedisService } from './services/redis.services';

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class CommonModule {}
