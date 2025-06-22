export class BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  path?: string;

  constructor(data?: T, message: string = 'Success') {
    this.success = true;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data?: T, message: string = 'Success'): BaseResponse<T> {
    return new BaseResponse<T>(data, message);
  }

  static error(message: string): BaseResponse<null> {
    const response = new BaseResponse<null>(null, message);
    response.success = false;
    return response;
  }
} 