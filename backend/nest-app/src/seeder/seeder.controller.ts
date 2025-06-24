import { Controller, Post, Get, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeederService } from './seeder.service';
import { BaseResponse } from '../common/dto/base.response';
import { Public } from 'nest-keycloak-connect';

@ApiTags('seeder')
@Controller('seeder')
@Public()
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

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all data from database entities' })
  @ApiResponse({ status: 200, description: 'Database cleared successfully' })
  @ApiResponse({ status: 500, description: 'Database clearing failed' })
  async clearDatabase(): Promise<BaseResponse<any>> {
    try {
      await this.seederService.clearAllData();
      const stats = await this.seederService.getSeederStats();
      
      return BaseResponse.success(
        stats,
        'All database entities cleared successfully'
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