import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseResponse } from '../dto/base.response';
import { ApiException } from '../exceptions/api.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let data: any = null;

    // ✅ Handle custom ApiException
    if (exception instanceof ApiException) {
      status = exception.getStatus();
      message = exception.message;
      data = {
        errorCode: exception.errorCode,
      };
    }

    // ✅ Handle built-in HttpException (including BadRequestException for validation)
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        const res = exceptionResponse as any;
        message = res.message || exception.message || message;
        if (res.data) {
          data = res.data;
        } else if (res.errors) {
          data = { errors: res.errors };
        }
      }
    }

    // ✅ Handle standard JS errors
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // ✅ Log the error stack (optional but helpful)
    this.logger.error(
      `${request.method} ${request.url} - Error: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    // ✅ Build response
    const errorResponse = new BaseResponse(data, message);
    errorResponse.success = false;
    errorResponse.path = request.url;

    response.status(status).json(errorResponse);
  }
} 