import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeederService } from './seeder.service';
import { BaseResponse } from '../common/dto/base.response';

@ApiTags('seeder')
@Controller('seeder')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Post('seed')
  @ApiOperation({ summary: 'Seed the database with demo data' })
  @ApiResponse({ status: 201, description: 'Database seeded successfully' })
  @ApiResponse({ status: 500, description: 'Seeding failed' })
  async seed(): Promise<BaseResponse<any>> {
    try {
      await this.seederService.seedAll();
      const stats = await this.seederService.getSeederStats();
      
      return BaseResponse.success(
        stats,
        'Database seeded successfully with demo data'
      );
    } catch (error) {
      throw error;
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get database seeding statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(): Promise<BaseResponse<any>> {
    const stats = await this.seederService.getSeederStats();
    
    return BaseResponse.success(
      stats,
      'Database statistics retrieved successfully'
    );
  }
} 