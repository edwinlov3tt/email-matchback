import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { MatchRecord } from '../campaigns/entities/match-record.entity';
import { User } from '../users/entities/user.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'matchback',
  password: process.env.DATABASE_PASSWORD || 'matchback_dev_password',
  database: process.env.DATABASE_NAME || 'matchback_db',
  entities: [Campaign, MatchRecord, User],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // Use migrations in production
  logging: process.env.NODE_ENV === 'development',
});
