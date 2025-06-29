import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  User,
  Skill,
  UserSkill,
  Project,
  ProjectSkill,
  Application,
  Team,
  Rating,
} from '../entities/index';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 3306),
  username: configService.get('DB_USERNAME', 'teamlink_user'),
  password: configService.get('DB_PASSWORD', 'teamlink_password'),
  database: configService.get('DB_DATABASE', 'teamlink_db'),
  entities: [User, Skill, UserSkill, Project, ProjectSkill, Application, Team, Rating],
  synchronize: configService.get('NODE_ENV') !== 'production', // Only for development
  logging: configService.get('NODE_ENV') !== 'production',
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'migrations',
}); 