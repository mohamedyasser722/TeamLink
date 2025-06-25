import {
  Controller,
  Get,
  Post,
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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { UpdateApplicationStatusDto } from './dtos/update-application-status.dto';
import { BaseResponse } from '../common/dto/base.response';
import { Project } from '../entities/project.entity';
import { Application } from '../entities/application.entity';
import { UserRole } from '../auth/enums/user-roles.enum';

@ApiTags('projects')
@Controller('projects')
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles({ roles: ['leader'] })
  @ApiOperation({ summary: 'Create a new project (Leaders only)' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 403, description: 'Only leaders can create projects' })
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @AuthenticatedUser() keycloakUser: any,
  ): Promise<BaseResponse<Project>> {
    const project = await this.projectsService.createProject(
      createProjectDto,
      keycloakUser,
    );
    return BaseResponse.success(project, 'Project created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all open projects' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  async getAllProjects(): Promise<BaseResponse<Project[]>> {
    const projects = await this.projectsService.findAllProjects();
    return BaseResponse.success(projects, 'Projects retrieved successfully');
  }

  @Get('my-projects')
  @Roles({ roles: ['leader'] })
  @ApiOperation({ summary: 'Get my owned projects (Leaders only)' })
  @ApiResponse({ status: 200, description: 'My projects retrieved successfully' })
  async getMyProjects(@AuthenticatedUser() keycloakUser: any): Promise<BaseResponse<Project[]>> {
    const projects = await this.projectsService.getMyProjects(keycloakUser);
    return BaseResponse.success(projects, 'My projects retrieved successfully');
  }

  @Get('my-applications')
  @Roles({ roles: ['freelancer'] })
  @ApiOperation({ summary: 'Get my applications (Freelancers only)' })
  @ApiResponse({ status: 200, description: 'My applications retrieved successfully' })
  async getMyApplications(@AuthenticatedUser() keycloakUser: any): Promise<BaseResponse<Application[]>> {
    const applications = await this.projectsService.getMyApplications(keycloakUser);
    return BaseResponse.success(applications, 'My applications retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProjectById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseResponse<Project>> {
    const project = await this.projectsService.findProjectById(id);
    return BaseResponse.success(project, 'Project retrieved successfully');
  }

  @Put(':id')
  @Roles({ roles: ['leader'] })
  @ApiOperation({ summary: 'Update project (Leaders only)' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 403, description: 'You can only update your own projects' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async updateProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @AuthenticatedUser() keycloakUser: any,
  ): Promise<BaseResponse<Project>> {
    const project = await this.projectsService.updateProject(
      id,
      updateProjectDto,
      keycloakUser,
    );
    return BaseResponse.success(project, 'Project updated successfully');
  }

  @Delete(':id')
  @Roles({ roles: ['leader'] })
  @ApiOperation({ summary: 'Delete project (Leaders only)' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 403, description: 'You can only delete your own projects' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async deleteProject(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthenticatedUser() keycloakUser: any,
  ): Promise<BaseResponse<null>> {
    await this.projectsService.deleteProject(id, keycloakUser);
    return BaseResponse.success(null, 'Project deleted successfully');
  }

  @Post(':id/applications')
  @Roles({ roles: ['freelancer'] })
  @ApiOperation({ summary: 'Apply to a project (Freelancers only)' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot apply to own project or already applied' })
  async applyToProject(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthenticatedUser() keycloakUser: any,
  ): Promise<BaseResponse<Application>> {
    const application = await this.projectsService.applyToProject(id, keycloakUser);
    return BaseResponse.success(application, 'Application submitted successfully');
  }

  @Get(':id/applications')
  @Roles({ roles: ['leader'] })
  @ApiOperation({ summary: 'Get project applications (Leaders only)' })
  @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
  @ApiResponse({ status: 403, description: 'You can only view applications for your own projects' })
  async getProjectApplications(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthenticatedUser() keycloakUser: any,
  ): Promise<BaseResponse<Application[]>> {
    const applications = await this.projectsService.getProjectApplications(
      id,
      keycloakUser,
    );
    return BaseResponse.success(applications, 'Applications retrieved successfully');
  }

  @Put(':projectId/applications/:applicationId/status')
  @Roles({ roles: ['leader'] })
  @ApiOperation({ summary: 'Update application status (Leaders only)' })
  @ApiResponse({ status: 200, description: 'Application status updated successfully' })
  @ApiResponse({ status: 403, description: 'You can only manage applications for your own projects' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async updateApplicationStatus(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() updateDto: UpdateApplicationStatusDto,
    @AuthenticatedUser() keycloakUser: any,
  ): Promise<BaseResponse<Application>> {
    const application = await this.projectsService.updateApplicationStatus(
      projectId,
      applicationId,
      updateDto,
      keycloakUser,
    );
    return BaseResponse.success(application, 'Application status updated successfully');
  }
} 