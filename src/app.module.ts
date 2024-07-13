import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { applicationConfig } from 'config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

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
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
