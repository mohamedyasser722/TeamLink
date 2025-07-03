import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from '../entities/project.entity';
import { Application } from '../entities/application.entity';
import { Team } from '../entities/team.entity';
import { ProjectSkill } from '../entities/project-skill.entity';
import { Rating } from '../entities/rating.entity';
import { UserSkill } from '../entities/user-skill.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Application, Team, ProjectSkill, Rating, UserSkill]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {} 