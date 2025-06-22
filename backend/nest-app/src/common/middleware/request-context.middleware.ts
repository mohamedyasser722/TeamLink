import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = uuidv4();
      req['requestId'] = requestId;

      // Log the incoming request
      this.logger.debug(
        `Incoming ${req.method} ${req.url} - RequestID: ${requestId}`,
      );

      // Track response time
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.logger.debug(
          `${req.method} ${req.url} - RequestID: ${requestId} - Status: ${res.statusCode} - Duration: ${duration}ms`,
        );
      });

      next();
    } catch (error) {
      this.logger.error('Error in RequestContextMiddleware:', error);
      next();
    }
  }
} 