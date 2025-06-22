import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  constructor(
    public readonly message: string,
    statusCode = HttpStatus.BAD_REQUEST,
    public readonly errorCode?: string,
  ) {
    super({ message }, statusCode);
  }
} 