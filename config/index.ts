import 'dotenv/config';
import { Dialect } from 'sequelize';
import { Algorithm } from 'jsonwebtoken';

export const applicationConfig = {
  app: {
    port: process.env.PORT || 5500,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dashchat-secret',
    expiresIn: '24h',
    algorithm: 'HS256' as Algorithm,
    issuer: 'dashchat-server',
    emailTokenExpiresIn: '5m',
  },

  db: {
    dialect: (process.env.DB_DIALECT || 'postgres') as Dialect,
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'dashchat-server',
    port: process.env.DB_PORT || '5432',
  },

  aws: {
    accessKey: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },

  linkedin: {
    serverUrl: 'https://www.linkedin.com/oauth/v2',
    userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
    clientId: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
    redirectUrl: process.env.REDIRECT_URI,
  },
};
