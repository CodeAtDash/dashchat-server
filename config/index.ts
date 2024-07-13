import 'dotenv/config';
import { Dialect } from 'sequelize';
import { Algorithm } from 'jsonwebtoken';

export const applicationConfig = {
  app: {
    port: process.env.PORT || 8808,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'gradeviser-server-secret',
    expiresIn: '24h',
    algorithm: 'HS256' as Algorithm,
    issuer: 'gradeviser-server',
    emailTokenExpiresIn: '5m',
  },

  db: {
    dialect: (process.env.DB_DIALECT || 'postgres') as Dialect,
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'gradeviser-server',
    port: process.env.DB_PORT || '5432',
  },

  aws: {
    accessKey: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  },
};
