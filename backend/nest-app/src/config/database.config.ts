import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  User,
  Skill,
  UserSkill,
  Project,
  Application,
  Team,
} from '../entities/index';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'teamlink_user',
  password: process.env.DB_PASSWORD || 'teamlink_password',
  database: process.env.DB_DATABASE || 'teamlink_db',
  entities: [User, Skill, UserSkill, Project, Application, Team],
  synchronize: process.env.NODE_ENV !== 'production', // Only for development
  logging: process.env.NODE_ENV !== 'production',
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'migrations',
}; 