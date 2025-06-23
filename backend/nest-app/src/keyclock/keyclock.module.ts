import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import {
  AuthGuard,
  KeycloakConnectModule,
  RoleGuard,
} from 'nest-keycloak-connect';
import { AuthController } from './auth.controller';
import { KeycloakService } from './keyclock.service';

@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        authServerUrl:
          configService.getOrThrow<string>('KEYCLOAK_AUTH_SERVER_URL'),
        realm: configService.getOrThrow<string>('KEYCLOAK_REALM'),
        clientId:
          configService.getOrThrow<string>('KEYCLOAK_CLIENT_ID'),
        secret: configService.getOrThrow<string>('KEYCLOAK_SECRET'),
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    KeycloakService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  exports: [KeycloakService],
})
export class KeycloakModule {}
