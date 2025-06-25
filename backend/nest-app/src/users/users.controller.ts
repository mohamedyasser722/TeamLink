import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { AddSkillDto } from './dtos/add-skill.dto';
import { BaseResponse } from '../common/dto/base.response';
import { User } from '../entities/user.entity';
import { UserSkill } from '../entities/user-skill.entity';
import { KeycloakService } from '../keyclock/keyclock.service';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly keycloakService: KeycloakService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get my profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getMyProfile(@AuthenticatedUser() keycloakUser: any): Promise<BaseResponse<any>> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);
    const userInfo = this.keycloakService.extractUserInfo(keycloakUser);
    
    // Determine role based on Keycloak roles
    let role = 'freelancer'; // default
    if (userInfo?.roles?.includes('leader')) {
      role = 'leader';
    }
    
    const userWithRole = {
      ...user,
      role,
    };
    
    return BaseResponse.success(userWithRole, 'Profile retrieved successfully');
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update my profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateMyProfile(
    @AuthenticatedUser() keycloakUser: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<BaseResponse<User>> {
    const user = await this.usersService.updateProfile(keycloakUser, updateProfileDto);
    return BaseResponse.success(user, 'Profile updated successfully');
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers(): Promise<BaseResponse<User[]>> {
    const users = await this.usersService.getAllUsers();
    return BaseResponse.success(users, 'Users retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseResponse<User>> {
    const user = await this.usersService.findUserById(id);
    return BaseResponse.success(user, 'User retrieved successfully');
  }

  @Get('skills/my-skills')
  @ApiOperation({ summary: 'Get my skills' })
  @ApiResponse({ status: 200, description: 'Skills retrieved successfully' })
  async getMySkills(@AuthenticatedUser() keycloakUser: any): Promise<BaseResponse<UserSkill[]>> {
    const skills = await this.usersService.getMySkills(keycloakUser);
    return BaseResponse.success(skills, 'Skills retrieved successfully');
  }

  @Post('skills')
  @ApiOperation({ summary: 'Add skill to my profile' })
  @ApiResponse({ status: 201, description: 'Skill added successfully' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  async addSkill(
    @AuthenticatedUser() keycloakUser: any,
    @Body() addSkillDto: AddSkillDto,
  ): Promise<BaseResponse<UserSkill>> {
    const userSkill = await this.usersService.addSkillToUser(keycloakUser, addSkillDto);
    return BaseResponse.success(userSkill, 'Skill added successfully');
  }

  @Delete('skills/:skillId')
  @ApiOperation({ summary: 'Remove skill from my profile' })
  @ApiResponse({ status: 200, description: 'Skill removed successfully' })
  @ApiResponse({ status: 404, description: 'User skill not found' })
  async removeSkill(
    @AuthenticatedUser() keycloakUser: any,
    @Param('skillId', ParseUUIDPipe) skillId: string,
  ): Promise<BaseResponse<null>> {
    await this.usersService.removeSkillFromUser(keycloakUser, skillId);
    return BaseResponse.success(null, 'Skill removed successfully');
  }

  @Get(':id/skills')
  @ApiOperation({ summary: 'Get user skills by user ID' })
  @ApiResponse({ status: 200, description: 'User skills retrieved successfully' })
  async getUserSkills(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseResponse<UserSkill[]>> {
    const skills = await this.usersService.getUserSkills(id);
    return BaseResponse.success(skills, 'User skills retrieved successfully');
  }
} 