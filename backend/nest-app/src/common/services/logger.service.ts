import { Injectable, Logger, LogLevel } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  constructor() {
    super();
  }

  log(message: string, context?: string) {
    super.log(message, context || 'Application');
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context || 'Application');
  }

  warn(message: string, context?: string) {
    super.warn(message, context || 'Application');
  }

  debug(message: string, context?: string) {
    super.debug(message, context || 'Application');
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context || 'Application');
  }
} 