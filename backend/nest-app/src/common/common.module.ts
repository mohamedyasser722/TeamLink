import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { ValidationPipe } from './pipes/validation.pipe';
import { LoggerService } from './services/logger.service';
import { RequestContextMiddleware } from './middleware/request-context.middleware';

@Global()
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    LoggerService,
    RequestContextMiddleware,
  ],
  exports: [
    LoggerService,
    RequestContextMiddleware,
  ],
})
export class CommonModule {} 