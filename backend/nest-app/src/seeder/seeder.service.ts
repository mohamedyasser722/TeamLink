import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  User,
  Skill,
  UserSkill,
  Project,
  Application,
  Team,
} from '../entities/index';
import { SkillLevel } from '../entities/enums/skill-level.enum';
import { ProjectStatus } from '../entities/enums/project-status.enum';
import { ApplicationStatus } from '../entities/enums/application-status.enum';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(UserSkill)
    private userSkillRepository: Repository<UserSkill>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    private logger: LoggerService,
  ) {}

  async seedAll(): Promise<void> {
    try {
      this.logger.log('Starting database seeding...', 'SeederService');

      // Clear existing data (optional - be careful in production)
      await this.clearDatabase();

      // Seed in proper order due to relationships
      const skills = await this.seedSkills();
      const users = await this.seedUsers();
      await this.seedUserSkills(users, skills);
      const projects = await this.seedProjects(users);
      await this.seedApplications(users, projects);
      await this.seedTeams(users, projects);

      this.logger.log('Database seeding completed successfully!', 'SeederService');
    } catch (error) {
      this.logger.error('Database seeding failed:', error.stack, 'SeederService');
      throw error;
    }
  }

  private async clearDatabase(): Promise<void> {
    this.logger.log('Clearing existing data...', 'SeederService');
    
    // Delete in reverse order of dependencies using query builder
    await this.teamRepository.createQueryBuilder().delete().execute();
    await this.applicationRepository.createQueryBuilder().delete().execute();
    await this.userSkillRepository.createQueryBuilder().delete().execute();
    await this.projectRepository.createQueryBuilder().delete().execute();
    await this.skillRepository.createQueryBuilder().delete().execute();
    await this.userRepository.createQueryBuilder().delete().execute();
  }

  private async seedSkills(): Promise<Skill[]> {
    this.logger.log('Seeding skills...', 'SeederService');

    const skillsData = [
      { name: 'JavaScript' },
      { name: 'TypeScript' },
      { name: 'React' },
      { name: 'Node.js' },
      { name: 'Python' },
      { name: 'Django' },
      { name: 'UI/UX Design' },
      { name: 'MySQL' },
      { name: 'PostgreSQL' },
      { name: 'Docker' },
      { name: 'AWS' },
      { name: 'Mobile Development' },
      { name: 'Project Management' },
      { name: 'DevOps' },
      { name: 'Machine Learning' },
    ];

    const skills = this.skillRepository.create(skillsData);
    return await this.skillRepository.save(skills);
  }

  private async seedUsers(): Promise<User[]> {
    this.logger.log('Seeding users...', 'SeederService');

    const usersData = [
      {
        keycloakId: 'kc-001',
        username: 'john_doe',
        email: 'john@example.com',
        bio: 'Full-stack developer with 5 years of experience in React and Node.js. Passionate about building scalable web applications.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      },
      {
        keycloakId: 'kc-002',
        username: 'sarah_wilson',
        email: 'sarah@example.com',
        bio: 'UI/UX Designer and frontend developer. Love creating beautiful and intuitive user experiences.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      },
      {
        keycloakId: 'kc-003',
        username: 'mike_chen',
        email: 'mike@example.com',
        bio: 'Backend engineer specializing in Python and cloud infrastructure. DevOps enthusiast.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      },
      {
        keycloakId: 'kc-004',
        username: 'emily_davis',
        email: 'emily@example.com',
        bio: 'Project manager with technical background. Experienced in leading cross-functional teams.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      },
      {
        keycloakId: 'kc-005',
        username: 'alex_rodriguez',
        email: 'alex@example.com',
        bio: 'Mobile app developer with expertise in React Native and iOS development.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      },
      {
        keycloakId: 'kc-006',
        username: 'lisa_kim',
        email: 'lisa@example.com',
        bio: 'Data scientist and ML engineer. Passionate about turning data into actionable insights.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      },
      {
        keycloakId: 'kc-007',
        username: 'david_johnson',
        email: 'david@example.com',
        bio: 'DevOps engineer with expertise in AWS, Docker, and CI/CD pipelines.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      },
    ];

    const users = this.userRepository.create(usersData);
    return await this.userRepository.save(users);
  }

  private async seedUserSkills(users: User[], skills: Skill[]): Promise<void> {
    this.logger.log('Seeding user skills...', 'SeederService');

    const userSkillsData = [
      // John Doe - Full-stack developer
      { user: users[0], skill: skills[0], level: SkillLevel.EXPERT }, // JavaScript
      { user: users[0], skill: skills[1], level: SkillLevel.EXPERT }, // TypeScript
      { user: users[0], skill: skills[2], level: SkillLevel.EXPERT }, // React
      { user: users[0], skill: skills[3], level: SkillLevel.EXPERT }, // Node.js
      { user: users[0], skill: skills[7], level: SkillLevel.INTERMEDIATE }, // MySQL

      // Sarah Wilson - UI/UX Designer
      { user: users[1], skill: skills[2], level: SkillLevel.EXPERT }, // React
      { user: users[1], skill: skills[6], level: SkillLevel.EXPERT }, // UI/UX Design
      { user: users[1], skill: skills[0], level: SkillLevel.INTERMEDIATE }, // JavaScript
      { user: users[1], skill: skills[1], level: SkillLevel.BEGINNER }, // TypeScript

      // Mike Chen - Backend engineer
      { user: users[2], skill: skills[4], level: SkillLevel.EXPERT }, // Python
      { user: users[2], skill: skills[5], level: SkillLevel.EXPERT }, // Django
      { user: users[2], skill: skills[9], level: SkillLevel.EXPERT }, // Docker
      { user: users[2], skill: skills[10], level: SkillLevel.EXPERT }, // AWS
      { user: users[2], skill: skills[13], level: SkillLevel.EXPERT }, // DevOps

      // Emily Davis - Project Manager
      { user: users[3], skill: skills[12], level: SkillLevel.EXPERT }, // Project Management
      { user: users[3], skill: skills[0], level: SkillLevel.BEGINNER }, // JavaScript
      { user: users[3], skill: skills[6], level: SkillLevel.INTERMEDIATE }, // UI/UX Design

      // Alex Rodriguez - Mobile developer
      { user: users[4], skill: skills[11], level: SkillLevel.EXPERT }, // Mobile Development
      { user: users[4], skill: skills[2], level: SkillLevel.EXPERT }, // React
      { user: users[4], skill: skills[0], level: SkillLevel.EXPERT }, // JavaScript
      { user: users[4], skill: skills[1], level: SkillLevel.INTERMEDIATE }, // TypeScript

      // Lisa Kim - Data scientist
      { user: users[5], skill: skills[4], level: SkillLevel.EXPERT }, // Python
      { user: users[5], skill: skills[14], level: SkillLevel.EXPERT }, // Machine Learning
      { user: users[5], skill: skills[8], level: SkillLevel.EXPERT }, // PostgreSQL
      { user: users[5], skill: skills[10], level: SkillLevel.INTERMEDIATE }, // AWS

      // David Johnson - DevOps
      { user: users[6], skill: skills[9], level: SkillLevel.EXPERT }, // Docker
      { user: users[6], skill: skills[10], level: SkillLevel.EXPERT }, // AWS
      { user: users[6], skill: skills[13], level: SkillLevel.EXPERT }, // DevOps
      { user: users[6], skill: skills[4], level: SkillLevel.INTERMEDIATE }, // Python
    ];

    const userSkills = this.userSkillRepository.create(userSkillsData);
    await this.userSkillRepository.save(userSkills);
  }

  private async seedProjects(users: User[]): Promise<Project[]> {
    this.logger.log('Seeding projects...', 'SeederService');

    const projectsData = [
      {
        title: 'E-Commerce Platform',
        description: 'Building a modern e-commerce platform with React frontend and Node.js backend. Looking for experienced developers to join our team.',
        owner: users[0], // John Doe
        status: ProjectStatus.OPEN,
      },
      {
        title: 'Mobile Fitness App',
        description: 'Developing a comprehensive fitness tracking mobile app with social features. Need mobile developers and UI/UX designers.',
        owner: users[3], // Emily Davis
        status: ProjectStatus.OPEN,
      },
      {
        title: 'AI-Powered Analytics Dashboard',
        description: 'Creating an analytics dashboard with machine learning insights for business intelligence. Seeking ML engineers and full-stack developers.',
        owner: users[1], // Sarah Wilson
        status: ProjectStatus.OPEN,
      },
      {
        title: 'Microservices Architecture Migration',
        description: 'Migrating legacy monolith to microservices architecture using Docker and AWS. Need DevOps and backend engineers.',
        owner: users[2], // Mike Chen
        status: ProjectStatus.IN_PROGRESS,
      },
      {
        title: 'Educational Platform',
        description: 'Building an online learning platform with video streaming and interactive content. Looking for full-stack developers.',
        owner: users[4], // Alex Rodriguez
        status: ProjectStatus.OPEN,
      },
      {
        title: 'IoT Smart Home System',
        description: 'Developing a comprehensive smart home IoT system with mobile app control. Need embedded and mobile developers.',
        owner: users[5], // Lisa Kim
        status: ProjectStatus.CLOSED,
      },
    ];

    const projects = this.projectRepository.create(projectsData);
    return await this.projectRepository.save(projects);
  }

  private async seedApplications(users: User[], projects: Project[]): Promise<void> {
    this.logger.log('Seeding applications...', 'SeederService');

    const applicationsData = [
      // Applications for E-Commerce Platform
      { user: users[1], project: projects[0], status: ApplicationStatus.PENDING },
      { user: users[2], project: projects[0], status: ApplicationStatus.ACCEPTED },
      { user: users[6], project: projects[0], status: ApplicationStatus.PENDING },

      // Applications for Mobile Fitness App
      { user: users[4], project: projects[1], status: ApplicationStatus.ACCEPTED },
      { user: users[1], project: projects[1], status: ApplicationStatus.ACCEPTED },
      { user: users[0], project: projects[1], status: ApplicationStatus.PENDING },

      // Applications for AI-Powered Analytics Dashboard
      { user: users[5], project: projects[2], status: ApplicationStatus.ACCEPTED },
      { user: users[0], project: projects[2], status: ApplicationStatus.PENDING },
      { user: users[2], project: projects[2], status: ApplicationStatus.REJECTED },

      // Applications for Microservices Migration
      { user: users[6], project: projects[3], status: ApplicationStatus.ACCEPTED },
      { user: users[0], project: projects[3], status: ApplicationStatus.ACCEPTED },

      // Applications for Educational Platform
      { user: users[1], project: projects[4], status: ApplicationStatus.PENDING },
      { user: users[2], project: projects[4], status: ApplicationStatus.PENDING },
    ];

    const applications = this.applicationRepository.create(applicationsData);
    await this.applicationRepository.save(applications);
  }

  private async seedTeams(users: User[], projects: Project[]): Promise<void> {
    this.logger.log('Seeding teams...', 'SeederService');

    const teamsData = [
      // E-Commerce Platform Team
      { project: projects[0], user: users[0], roleTitle: 'Project Lead' },
      { project: projects[0], user: users[2], roleTitle: 'Backend Developer' },

      // Mobile Fitness App Team
      { project: projects[1], user: users[3], roleTitle: 'Project Manager' },
      { project: projects[1], user: users[4], roleTitle: 'Mobile Developer' },
      { project: projects[1], user: users[1], roleTitle: 'UI/UX Designer' },

      // AI Analytics Dashboard Team
      { project: projects[2], user: users[1], roleTitle: 'Project Lead' },
      { project: projects[2], user: users[5], roleTitle: 'ML Engineer' },

      // Microservices Migration Team
      { project: projects[3], user: users[2], roleTitle: 'DevOps Lead' },
      { project: projects[3], user: users[6], roleTitle: 'DevOps Engineer' },
      { project: projects[3], user: users[0], roleTitle: 'Backend Developer' },
    ];

    const teams = this.teamRepository.create(teamsData);
    await this.teamRepository.save(teams);
  }

  async getSeederStats(): Promise<any> {
    const stats = {
      users: await this.userRepository.count(),
      skills: await this.skillRepository.count(),
      userSkills: await this.userSkillRepository.count(),
      projects: await this.projectRepository.count(),
      applications: await this.applicationRepository.count(),
      teams: await this.teamRepository.count(),
    };

    return stats;
  }
} 