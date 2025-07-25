import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { CommonModule } from './common/common.module';
import { SeederModule } from './seeder/seeder.module';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { databaseConfig } from './config/database.config';
import { KeycloakModule } from './keyclock/keyclock.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { SkillsModule } from './skills/skills.module';
import { TeamsModule } from './teams/teams.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    CommonModule,
    SeederModule,
    KeycloakModule,
    AuthModule,
    ProjectsModule,
    UsersModule,
    SkillsModule,
    TeamsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
