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

  @Get(':id')
  @ApiOperation({ summary: 'Get skill by ID' })
  @ApiResponse({ status: 200, description: 'Skill retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async getSkillById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseResponse<Skill>> {
    const skill = await this.skillsService.findSkillById(id);
    return BaseResponse.success(skill, 'Skill retrieved successfully');
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new skill' })
  @ApiResponse({ status: 201, description: 'Skill created successfully' })
  @ApiResponse({ status: 409, description: 'Skill already exists' })
  async createSkill(
    @Body() createSkillDto: CreateSkillDto,
  ): Promise<BaseResponse<Skill>> {
    const skill = await this.skillsService.createSkill(createSkillDto);
    return BaseResponse.success(skill, 'Skill created successfully');
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a skill' })
  @ApiResponse({ status: 200, description: 'Skill deleted successfully' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async deleteSkill(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseResponse<null>> {
    await this.skillsService.deleteSkill(id);
    return BaseResponse.success(null, 'Skill deleted successfully');
  }
} 