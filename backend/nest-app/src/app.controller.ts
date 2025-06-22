import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseResponse } from './common/dto/base.response';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

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

  @Get('config')
  @ApiOperation({ summary: 'Configuration check endpoint' })
  @ApiResponse({ status: 200, description: 'Configuration status' })
  getConfig(): BaseResponse<any> {
    return BaseResponse.success({
      nodeEnv: this.configService.get('NODE_ENV'),
      port: this.configService.get('PORT'),
      dbHost: this.configService.get('DB_HOST'),
      dbPort: this.configService.get('DB_PORT'),
      dbDatabase: this.configService.get('DB_DATABASE'),
      // Don't expose sensitive data like passwords
      configStatus: 'Environment variables loaded successfully',
    }, 'Configuration loaded');
  }
}
