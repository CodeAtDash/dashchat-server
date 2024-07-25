import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { applicationConfig } from 'config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: applicationConfig.db.dialect,
      host: applicationConfig.db.host,
      username: applicationConfig.db.username,
      password: applicationConfig.db.password,
      database: applicationConfig.db.database,
      port: parseInt(applicationConfig.db.port, 10),
      logging: false,
      autoLoadModels: true,
      synchronize: true,
      ...(process.env.NODE_ENV !== 'development'
        ? {
            dialectOptions: {
              ssl: {
                rejectUnauthorized: false,
                sslmode: 'no-verify',
              },
            },
          }
        : {}),
    }),
    RedisModule.forRoot({
      type: 'single',
      options: {
        host: applicationConfig.redis.host || 'localhost',
        port: parseInt(applicationConfig.redis.port || '6379', 10),
      },
    }),
    AuthModule,
    UsersModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
