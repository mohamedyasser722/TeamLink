import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Application } from '../entities/application.entity';
import { Team } from '../entities/team.entity';
import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { UpdateApplicationStatusDto } from './dtos/update-application-status.dto';
import { ApplicationStatus } from '../entities/enums/application-status.enum';
import { ProjectStatus } from '../entities/enums/project-status.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    private usersService: UsersService,
  ) {}

  async createProject(createProjectDto: CreateProjectDto, keycloakUser: any): Promise<Project> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);
    
    const project = this.projectRepository.create({
      ...createProjectDto,
      ownerId: user.id,
    });
    return this.projectRepository.save(project);
  }

  async findAllProjects(): Promise<Project[]> {
    return this.projectRepository.find({
      where: { status: ProjectStatus.OPEN },
      relations: ['owner', 'applications', 'team'],
      select: {
        owner: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        },
      },
    });
  }

  async findProjectById(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['owner', 'applications', 'applications.user', 'team', 'team.user'],
      select: {
        owner: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        },
        applications: {
          id: true,
          status: true,
          createdAt: true,
          user: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
        team: {
          id: true,
          roleTitle: true,
          joinedAt: true,
          user: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async updateProject(id: string, updateProjectDto: UpdateProjectDto, keycloakUser: any): Promise<Project> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);
    const project = await this.findProjectById(id);
    
    if (project.ownerId !== user.id) {
      throw new ForbiddenException('You can only update your own projects');
    }

    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async deleteProject(id: string, keycloakUser: any): Promise<void> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);
    const project = await this.findProjectById(id);
    
    if (project.ownerId !== user.id) {
      throw new ForbiddenException('You can only delete your own projects');
    }

    await this.projectRepository.remove(project);
  }

  async getMyProjects(keycloakUser: any): Promise<Project[]> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);
    
    return this.projectRepository.find({
      where: { ownerId: user.id },
      relations: ['applications', 'applications.user', 'team', 'team.user'],
      select: {
        applications: {
          id: true,
          status: true,
          createdAt: true,
          user: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
        team: {
          id: true,
          roleTitle: true,
          joinedAt: true,
          user: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async applyToProject(projectId: string, keycloakUser: any): Promise<Application> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);
    const project = await this.findProjectById(projectId);
    
    if (project.ownerId === user.id) {
      throw new BadRequestException('You cannot apply to your own project');
    }

    if (project.status !== ProjectStatus.OPEN) {
      throw new BadRequestException('This project is not accepting applications');
    }

    // Check if user already applied
    const existingApplication = await this.applicationRepository.findOne({
      where: { projectId, userId: user.id },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied to this project');
    }

    const application = this.applicationRepository.create({
      projectId,
      userId: user.id,
    });

    return this.applicationRepository.save(application);
  }

  async getProjectApplications(projectId: string, keycloakUser: any): Promise<Application[]> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);
    const project = await this.findProjectById(projectId);
    
    if (project.ownerId !== user.id) {
      throw new ForbiddenException('You can only view applications for your own projects');
    }

    return this.applicationRepository.find({
      where: { projectId },
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          bio: true,
        },
      },
    });
  }

  async updateApplicationStatus(
    projectId: string,
    applicationId: string,
    updateDto: UpdateApplicationStatusDto,
    keycloakUser: any,
  ): Promise<Application> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);
    const project = await this.findProjectById(projectId);
    
    if (project.ownerId !== user.id) {
      throw new ForbiddenException('You can only manage applications for your own projects');
    }

    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, projectId },
      relations: ['user'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Update application status
    application.status = updateDto.status;
    const updatedApplication = await this.applicationRepository.save(application);

    // If accepted, add user to team
    if (updateDto.status === ApplicationStatus.ACCEPTED) {
      const roleTitle = updateDto.roleTitle || 'Team Member';
      
      // Check if user is already on the team
      const existingTeamMember = await this.teamRepository.findOne({
        where: { projectId, userId: application.userId },
      });

      if (!existingTeamMember) {
        const teamMember = this.teamRepository.create({
          projectId,
          userId: application.userId,
          roleTitle,
        });
        await this.teamRepository.save(teamMember);
      }
    }

    return updatedApplication;
  }

  async getMyApplications(keycloakUser: any): Promise<Application[]> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);
    
    return this.applicationRepository.find({
      where: { userId: user.id },
      relations: ['project', 'project.owner'],
      select: {
        project: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          owner: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
} 