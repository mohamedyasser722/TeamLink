import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { UserSkill } from '../entities/user-skill.entity';
import { Skill } from '../entities/skill.entity';
import { Rating } from '../entities/rating.entity';
import { KeycloakModule } from '../keyclock/keyclock.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSkill, Skill, Rating]),
    KeycloakModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {} 