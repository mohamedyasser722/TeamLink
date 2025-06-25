import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Roles, AuthenticatedUser } from 'nest-keycloak-connect';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { UpdateTeamMemberDto } from './dtos/update-team-member.dto';
import { BaseResponse } from '../common/dto/base.response';
import { Team } from '../entities/team.entity';
import { UserRole } from '../auth/enums/user-roles.enum';

@ApiTags('teams')
@Controller('teams')
@ApiBearerAuth()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get('projects/:projectId')
  @ApiOperation({ summary: 'Get project team members' })
  @ApiResponse({ status: 200, description: 'Team members retrieved successfully' })
  async getProjectTeam(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<BaseResponse<Team[]>> {
    const team = await this.teamsService.getProjectTeam(projectId);
    return BaseResponse.success(team, 'Team members retrieved successfully');
  }

  @Get('my-memberships')
  @ApiOperation({ summary: 'Get my team memberships' })
  @ApiResponse({ status: 200, description: 'Team memberships retrieved successfully' })
  async getMyTeamMemberships(@AuthenticatedUser() keycloakUser: any): Promise<BaseResponse<Team[]>> {
    const memberships = await this.teamsService.getMyTeamMemberships(keycloakUser);
    return BaseResponse.success(memberships, 'Team memberships retrieved successfully');
  }

  @Put('projects/:projectId/members/:teamId')
  @Roles({ roles: ['leader'] })
  @ApiOperation({ summary: 'Update team member role (Leaders only)' })
  @ApiResponse({ status: 200, description: 'Team member role updated successfully' })
  @ApiResponse({ status: 403, description: 'You can only manage team members for your own projects' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  async updateTeamMemberRole(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Body() updateDto: UpdateTeamMemberDto,
    @AuthenticatedUser() keycloakUser: any,
  ): Promise<BaseResponse<Team>> {
    const teamMember = await this.teamsService.updateTeamMemberRole(
      projectId,
      teamId,
      updateDto,
      keycloakUser,
    );
    return BaseResponse.success(teamMember, 'Team member role updated successfully');
  }

  @Delete('projects/:projectId/members/:teamId')
  @Roles({ roles: ['leader'] })
  @ApiOperation({ summary: 'Remove team member from project (Leaders only)' })
  @ApiResponse({ status: 200, description: 'Team member removed successfully' })
  @ApiResponse({ status: 403, description: 'You can only manage team members for your own projects' })
  @ApiResponse({ status: 404, description: 'Team member not found' })
  async removeTeamMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @AuthenticatedUser() keycloakUser: any,
  ): Promise<BaseResponse<null>> {
    await this.teamsService.removeTeamMember(projectId, teamId, keycloakUser);
    return BaseResponse.success(null, 'Team member removed successfully');
  }
} 