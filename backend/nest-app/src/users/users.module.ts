import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { UserSkill } from '../entities/user-skill.entity';
import { Skill } from '../entities/skill.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, UserSkill, Skill])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {} 