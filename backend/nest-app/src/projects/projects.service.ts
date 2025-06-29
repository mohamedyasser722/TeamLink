import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Application } from '../entities/application.entity';
import { Team } from '../entities/team.entity';
import { ProjectSkill } from '../entities/project-skill.entity';
import { Rating } from '../entities/rating.entity';
import { UserSkill } from '../entities/user-skill.entity';
import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { UpdateApplicationStatusDto } from './dtos/update-application-status.dto';
import { CreateRatingDto } from './dtos/create-rating.dto';
import { ProjectMatchDto, ProjectSkillMatchDto } from './dtos/project-match.dto';
import { ApplicationStatus } from '../entities/enums/application-status.enum';
import { ProjectStatus } from '../entities/enums/project-status.enum';
import { SkillLevel } from '../entities/enums/skill-level.enum';
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
    @InjectRepository(ProjectSkill)
    private projectSkillRepository: Repository<ProjectSkill>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(UserSkill)
    private userSkillRepository: Repository<UserSkill>,
    private usersService: UsersService,
  ) {}

  async createProject(createProjectDto: CreateProjectDto, keycloakUser: any): Promise<Project> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);
    
    const project = this.projectRepository.create({
      title: createProjectDto.title,
      description: createProjectDto.description,
      ownerId: user.id,
    });
    
    const savedProject = await this.projectRepository.save(project);

    // Add required skills if provided
    if (createProjectDto.requiredSkills && createProjectDto.requiredSkills.length > 0) {
      const projectSkills = createProjectDto.requiredSkills.map(skill => 
        this.projectSkillRepository.create({
          projectId: savedProject.id,
          skillId: skill.skillId,
          requiredLevel: skill.requiredLevel,
        })
      );
      await this.projectSkillRepository.save(projectSkills);
    }

    return savedProject;
  }

  async findAllProjects(): Promise<Project[]> {
    return this.projectRepository.find({
      where: { status: ProjectStatus.OPEN },
      relations: ['owner', 'applications', 'team', 'projectSkills', 'projectSkills.skill'],
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
      relations: [
        'owner', 
        'applications', 
        'applications.user', 
        'applications.user.userSkills',
        'applications.user.userSkills.skill',
        'applications.user.receivedRatings',
        'applications.user.receivedRatings.rater',
        'applications.user.receivedRatings.project',
        'team', 
        'team.user',
        'projectSkills',
        'projectSkills.skill'
      ],
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
            bio: true,
            avatarUrl: true,
            createdAt: true,
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

    // Update basic project fields
    const { requiredSkills, ...basicFields } = updateProjectDto;
    Object.assign(project, basicFields);
    const updatedProject = await this.projectRepository.save(project);

    // Handle required skills update if provided
    if (requiredSkills !== undefined) {
      // Delete existing project skills
      await this.projectSkillRepository.delete({ projectId: id });

      // Add new required skills if any
      if (requiredSkills.length > 0) {
        const projectSkills = requiredSkills.map(skill => 
          this.projectSkillRepository.create({
            projectId: id,
            skillId: skill.skillId,
            requiredLevel: skill.requiredLevel,
          })
        );
        await this.projectSkillRepository.save(projectSkills);
      }
    }

    return updatedProject;
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



  async rateUser(projectId: string, createRatingDto: CreateRatingDto, keycloakUser: any): Promise<Rating> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);
    const project = await this.findProjectById(projectId);
    
    if (project.ownerId !== user.id) {
      throw new ForbiddenException('You can only rate users on your own projects');
    }

    if (project.status !== ProjectStatus.COMPLETED) {
      throw new BadRequestException('You can only rate users after the project is completed');
    }

    // Prevent project leaders from rating themselves
    if (createRatingDto.ratedUserId === user.id) {
      throw new BadRequestException('You cannot rate yourself');
    }

    // Check if the user being rated was part of the team
    const teamMember = await this.teamRepository.findOne({
      where: { projectId, userId: createRatingDto.ratedUserId },
    });

    if (!teamMember) {
      throw new BadRequestException('You can only rate users who were part of your project team');
    }

    // Check if rating already exists
    const existingRating = await this.ratingRepository.findOne({
      where: { 
        raterId: user.id, 
        ratedUserId: createRatingDto.ratedUserId, 
        projectId 
      },
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this user for this project');
    }

    const rating = this.ratingRepository.create({
      raterId: user.id,
      ratedUserId: createRatingDto.ratedUserId,
      projectId,
      rating: createRatingDto.rating,
      comment: createRatingDto.comment,
    });

    return this.ratingRepository.save(rating);
  }

  async getRecommendedProjects(keycloakUser: any): Promise<ProjectMatchDto[]> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);
    
    // Get user skills
    const userSkills = await this.userSkillRepository.find({
      where: { userId: user.id },
      relations: ['skill'],
    });

    if (userSkills.length === 0) {
      return [];
    }

    // Get all open projects with their required skills
    const projects = await this.projectRepository.find({
      where: { status: ProjectStatus.OPEN },
      relations: ['owner', 'projectSkills', 'projectSkills.skill'],
    });

    const projectMatches: ProjectMatchDto[] = [];

    for (const project of projects) {
      // Skip own projects
      if (project.ownerId === user.id) {
        continue;
      }

      // Skip if no required skills
      if (!project.projectSkills || project.projectSkills.length === 0) {
        continue;
      }

      const skillMatches: ProjectSkillMatchDto[] = [];
      let matchedSkills = 0;

      for (const projectSkill of project.projectSkills) {
        const userSkill = userSkills.find(us => us.skillId === projectSkill.skillId);
        
        const isMatch = userSkill ? this.isSkillLevelMatch(userSkill.level, projectSkill.requiredLevel) : false;
        
        if (isMatch) {
          matchedSkills++;
        }

        skillMatches.push({
          skillName: projectSkill.skill.name,
          requiredLevel: projectSkill.requiredLevel,
          userLevel: userSkill?.level || null,
          isMatch,
        });
      }

      const matchPercentage = (matchedSkills / project.projectSkills.length) * 100;

      // Only include projects with at least some skill match
      if (matchedSkills > 0) {
        projectMatches.push({
          id: project.id,
          title: project.title,
          description: project.description,
          status: project.status,
          createdAt: project.createdAt,
          owner: {
            id: project.owner.id,
            username: project.owner.username,
            avatarUrl: project.owner.avatarUrl,
          },
          skillMatches,
          matchPercentage: Math.round(matchPercentage),
          totalRequiredSkills: project.projectSkills.length,
          matchedSkills,
        });
      }
    }

    // Sort by match percentage (highest first)
    return projectMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  private isSkillLevelMatch(userLevel: SkillLevel, requiredLevel: SkillLevel): boolean {
    const levelHierarchy = {
      [SkillLevel.BEGINNER]: 1,
      [SkillLevel.INTERMEDIATE]: 2,
      [SkillLevel.EXPERT]: 3,
    };

    return levelHierarchy[userLevel] >= levelHierarchy[requiredLevel];
  }

  async getRateableTeamMembers(projectId: string, keycloakUser: any): Promise<any[]> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);
    const project = await this.findProjectById(projectId);
    
    if (project.ownerId !== user.id) {
      throw new ForbiddenException('You can only view team members for your own projects');
    }

    if (project.status !== ProjectStatus.COMPLETED) {
      throw new BadRequestException('You can only rate team members after the project is completed');
    }

    // Get all team members for this project
    const teamMembers = await this.teamRepository.find({
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

    // Filter out the project owner (leader) from team members - they can't rate themselves
    const rateableTeamMembers = teamMembers.filter(teamMember => teamMember.userId !== user.id);

    // Get existing ratings for this project
    const existingRatings = await this.ratingRepository.find({
      where: { projectId, raterId: user.id },
    });

    // Map team members with their rating status
    const rateableMembers = rateableTeamMembers.map(teamMember => {
      const existingRating = existingRatings.find(
        rating => rating.ratedUserId === teamMember.userId
      );

      return {
        teamMemberId: teamMember.id,
        user: teamMember.user,
        roleTitle: teamMember.roleTitle,
        joinedAt: teamMember.joinedAt,
        hasBeenRated: !!existingRating,
        existingRating: existingRating ? {
          id: existingRating.id,
          rating: existingRating.rating,
          comment: existingRating.comment,
          createdAt: existingRating.createdAt,
        } : null,
      };
    });

    return rateableMembers;
  }
} 