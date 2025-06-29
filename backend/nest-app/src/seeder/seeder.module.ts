import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Skill,
      UserSkill,
      Project,
      ProjectSkill,
      Application,
      Team,
      Rating,
    ]),
  ],
  controllers: [SeederController],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {} 