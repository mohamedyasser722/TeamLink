import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dtos/create-skill.dto';
import { BaseResponse } from '../common/dto/base.response';
import { Skill } from '../entities/skill.entity';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all skills' })
  @ApiResponse({ status: 200, description: 'Skills retrieved successfully' })
  @ApiQuery({ name: 'search', required: false, description: 'Search skills by name' })
  async getAllSkills(@Query('search') search?: string): Promise<BaseResponse<Skill[]>> {
    const skills = search
      ? await this.skillsService.searchSkills(search)
      : await this.skillsService.findAllSkills();
    return BaseResponse.success(skills, 'Skills retrieved successfully');
  }


} 