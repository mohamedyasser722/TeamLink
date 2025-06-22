import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseResponse } from './common/dto/base.response';

@ApiTags('health')
@Controller()
export class AppController {
  constructor() {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth(): BaseResponse<any> {
    return BaseResponse.success({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'TeamLink Backend',
    }, 'Service is healthy');
  }
}
