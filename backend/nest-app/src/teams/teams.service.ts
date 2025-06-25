import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { Project } from '../entities/project.entity';
import { UpdateTeamMemberDto } from './dtos/update-team-member.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private usersService: UsersService,
  ) {}

  async getProjectTeam(projectId: string): Promise<Team[]> {
    return this.teamRepository.find({
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
      order: { joinedAt: 'ASC' },
    });
  }

  async updateTeamMemberRole(
    projectId: string,
    teamId: string,
    updateDto: UpdateTeamMemberDto,
    keycloakUser: any,
  ): Promise<Team> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is the project owner
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== user.id) {
      throw new ForbiddenException('You can only manage team members for your own projects');
    }

    // Find the team member
    const teamMember = await this.teamRepository.findOne({
      where: { id: teamId, projectId },
      relations: ['user'],
    });

    if (!teamMember) {
      throw new NotFoundException('Team member not found');
    }

    // Update role title
    teamMember.roleTitle = updateDto.roleTitle;
    return this.teamRepository.save(teamMember);
  }

  async removeTeamMember(projectId: string, teamId: string, keycloakUser: any): Promise<void> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is the project owner
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== user.id) {
      throw new ForbiddenException('You can only manage team members for your own projects');
    }

    // Find the team member
    const teamMember = await this.teamRepository.findOne({
      where: { id: teamId, projectId },
    });

    if (!teamMember) {
      throw new NotFoundException('Team member not found');
    }

    await this.teamRepository.remove(teamMember);
  }

  async getMyTeamMemberships(keycloakUser: any): Promise<Team[]> {
    const user = await this.usersService.getOrCreateUser(keycloakUser);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.teamRepository.find({
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
      order: { joinedAt: 'DESC' },
    });
  }
} 