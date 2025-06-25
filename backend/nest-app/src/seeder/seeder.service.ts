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

  async clearAllData(): Promise<void> {
    try {
      this.logger.log('Clearing all database entities...', 'SeederService');
      await this.clearDatabase();
      this.logger.log('All database entities cleared successfully!', 'SeederService');
    } catch (error) {
      this.logger.error('Failed to clear database entities:', error.stack, 'SeederService');
      throw error;
    }
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
        // === LEADERS (Only these 2 can create/own projects) ===
        {
          keycloakId: 'e7f7196a-1d8a-419b-bed1-e6f925ed8cc6',
          username: 'yassen722',
          email: 'yassenmohamed722@gmail.com',
          bio: 'Experienced team leader and project manager. UI/UX Designer and frontend developer. Love creating beautiful and intuitive user experiences and leading successful teams.',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
          // LEADER - Can create projects and accept applications
        },
        {
          keycloakId: 'kc-003',
          username: 'mike_chen',
          email: 'mike@example.com',
          bio: 'Senior team leader and backend engineer specializing in Python and cloud infrastructure. DevOps enthusiast with strong leadership skills.',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
          // LEADER - Can create projects and accept applications
        },
        
        // === FREELANCERS (Can only apply to projects) ===
        {
          keycloakId: 'ad583a39-82ff-4ad7-aa42-af2474c5d1a9',
          username: 'mohamed722',
          email: 'mohamedyasser722@gmail.com',
          bio: 'Full-stack developer with 5 years of experience in React and Node.js. Passionate about building scalable web applications.',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
          // FREELANCER - Can only apply to projects
        },
        {
          keycloakId: 'kc-004',
          username: 'emily_davis',
          email: 'emily@example.com',
          bio: 'Freelance project coordinator with technical background. Experienced in supporting cross-functional teams.',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
          // FREELANCER - Can only apply to projects
        },
        {
          keycloakId: 'kc-005',
          username: 'alex_rodriguez',
          email: 'alex@example.com',
          bio: 'Freelance mobile app developer with expertise in React Native and iOS development.',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
          // FREELANCER - Can only apply to projects
        },
        {
          keycloakId: 'kc-006',
          username: 'lisa_kim',
          email: 'lisa@example.com',
          bio: 'Freelance data scientist and ML engineer. Passionate about turning data into actionable insights.',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
          // FREELANCER - Can only apply to projects
        },
        {
          keycloakId: 'kc-007',
          username: 'david_johnson',
          email: 'david@example.com',
          bio: 'Freelance DevOps engineer with expertise in AWS, Docker, and CI/CD pipelines.',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
          // FREELANCER - Can only apply to projects
        },
      ];

    const users = this.userRepository.create(usersData);
    return await this.userRepository.save(users);
  }

  private async seedUserSkills(users: User[], skills: Skill[]): Promise<void> {
    this.logger.log('Seeding user skills...', 'SeederService');

    const userSkillsData = [
      // === LEADERS ===
      // yassen722 - LEADER (UI/UX Designer and Frontend Developer)
      { user: users[0], skill: skills[2], level: SkillLevel.EXPERT }, // React
      { user: users[0], skill: skills[6], level: SkillLevel.EXPERT }, // UI/UX Design
      { user: users[0], skill: skills[0], level: SkillLevel.EXPERT }, // JavaScript
      { user: users[0], skill: skills[1], level: SkillLevel.INTERMEDIATE }, // TypeScript
      { user: users[0], skill: skills[12], level: SkillLevel.EXPERT }, // Project Management

      // mike_chen - LEADER (Backend Engineer and DevOps)
      { user: users[1], skill: skills[4], level: SkillLevel.EXPERT }, // Python
      { user: users[1], skill: skills[5], level: SkillLevel.EXPERT }, // Django
      { user: users[1], skill: skills[9], level: SkillLevel.EXPERT }, // Docker
      { user: users[1], skill: skills[10], level: SkillLevel.EXPERT }, // AWS
      { user: users[1], skill: skills[13], level: SkillLevel.EXPERT }, // DevOps
      { user: users[1], skill: skills[12], level: SkillLevel.EXPERT }, // Project Management

      // === FREELANCERS ===
      // mohamed722 - FREELANCER (Full-stack developer)
      { user: users[2], skill: skills[0], level: SkillLevel.EXPERT }, // JavaScript
      { user: users[2], skill: skills[1], level: SkillLevel.EXPERT }, // TypeScript
      { user: users[2], skill: skills[2], level: SkillLevel.EXPERT }, // React
      { user: users[2], skill: skills[3], level: SkillLevel.EXPERT }, // Node.js
      { user: users[2], skill: skills[7], level: SkillLevel.INTERMEDIATE }, // MySQL

      // emily_davis - FREELANCER (Project Coordinator)
      { user: users[3], skill: skills[12], level: SkillLevel.INTERMEDIATE }, // Project Management
      { user: users[3], skill: skills[0], level: SkillLevel.BEGINNER }, // JavaScript
      { user: users[3], skill: skills[6], level: SkillLevel.INTERMEDIATE }, // UI/UX Design

      // alex_rodriguez - FREELANCER (Mobile developer)
      { user: users[4], skill: skills[11], level: SkillLevel.EXPERT }, // Mobile Development
      { user: users[4], skill: skills[2], level: SkillLevel.EXPERT }, // React
      { user: users[4], skill: skills[0], level: SkillLevel.EXPERT }, // JavaScript
      { user: users[4], skill: skills[1], level: SkillLevel.INTERMEDIATE }, // TypeScript

      // lisa_kim - FREELANCER (Data scientist)
      { user: users[5], skill: skills[4], level: SkillLevel.EXPERT }, // Python
      { user: users[5], skill: skills[14], level: SkillLevel.EXPERT }, // Machine Learning
      { user: users[5], skill: skills[8], level: SkillLevel.EXPERT }, // PostgreSQL
      { user: users[5], skill: skills[10], level: SkillLevel.INTERMEDIATE }, // AWS

      // david_johnson - FREELANCER (DevOps)
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
        // === PROJECTS OWNED BY yassen722 (LEADER) ===
        {
          title: 'E-Commerce Platform',
          description: 'Building a modern e-commerce platform with React frontend and Node.js backend. Looking for experienced developers to join our team.',
          owner: users[0], // yassen722 (LEADER)
          status: ProjectStatus.OPEN,
        },
        {
          title: 'Mobile Fitness App',
          description: 'Developing a comprehensive fitness tracking mobile app with social features. Need mobile developers and UI/UX designers.',
          owner: users[0], // yassen722 (LEADER)
          status: ProjectStatus.OPEN,
        },
        {
          title: 'Educational Platform',
          description: 'Building an online learning platform with video streaming and interactive content. Looking for full-stack developers.',
          owner: users[0], // yassen722 (LEADER)
          status: ProjectStatus.IN_PROGRESS,
        },
        
        // === PROJECTS OWNED BY mike_chen (LEADER) ===
        {
          title: 'AI-Powered Analytics Dashboard',
          description: 'Creating an analytics dashboard with machine learning insights for business intelligence. Seeking ML engineers and full-stack developers.',
          owner: users[1], // mike_chen (LEADER)
          status: ProjectStatus.OPEN,
        },
        {
          title: 'Microservices Architecture Migration',
          description: 'Migrating legacy monolith to microservices architecture using Docker and AWS. Need DevOps and backend engineers.',
          owner: users[1], // mike_chen (LEADER)
          status: ProjectStatus.OPEN,
        },
        {
          title: 'IoT Smart Home System',
          description: 'Developing a comprehensive smart home IoT system with mobile app control. Need embedded and mobile developers.',
          owner: users[1], // mike_chen (LEADER)
          status: ProjectStatus.CLOSED,
        },
      ];

    const projects = this.projectRepository.create(projectsData);
    return await this.projectRepository.save(projects);
  }

  private async seedApplications(users: User[], projects: Project[]): Promise<void> {
    this.logger.log('Seeding applications...', 'SeederService');

    const applicationsData = [
      // === Applications for E-Commerce Platform (owned by yassen722) ===
      { user: users[2], project: projects[0], status: ApplicationStatus.ACCEPTED }, // mohamed722 (FREELANCER)
      { user: users[3], project: projects[0], status: ApplicationStatus.PENDING }, // emily_davis (FREELANCER)
      { user: users[6], project: projects[0], status: ApplicationStatus.PENDING }, // david_johnson (FREELANCER)

      // === Applications for Mobile Fitness App (owned by yassen722) ===
      { user: users[4], project: projects[1], status: ApplicationStatus.ACCEPTED }, // alex_rodriguez (FREELANCER)
      { user: users[2], project: projects[1], status: ApplicationStatus.PENDING }, // mohamed722 (FREELANCER)
      { user: users[3], project: projects[1], status: ApplicationStatus.REJECTED }, // emily_davis (FREELANCER)

      // === Applications for Educational Platform (owned by yassen722) ===
      { user: users[2], project: projects[2], status: ApplicationStatus.ACCEPTED }, // mohamed722 (FREELANCER)
      { user: users[5], project: projects[2], status: ApplicationStatus.PENDING }, // lisa_kim (FREELANCER)

      // === Applications for AI-Powered Analytics Dashboard (owned by mike_chen) ===
      { user: users[5], project: projects[3], status: ApplicationStatus.ACCEPTED }, // lisa_kim (FREELANCER)
      { user: users[2], project: projects[3], status: ApplicationStatus.PENDING }, // mohamed722 (FREELANCER)
      { user: users[6], project: projects[3], status: ApplicationStatus.REJECTED }, // david_johnson (FREELANCER)

      // === Applications for Microservices Migration (owned by mike_chen) ===
      { user: users[6], project: projects[4], status: ApplicationStatus.ACCEPTED }, // david_johnson (FREELANCER)
      { user: users[2], project: projects[4], status: ApplicationStatus.ACCEPTED }, // mohamed722 (FREELANCER)

      // === Applications for IoT Smart Home System (owned by mike_chen) ===
      { user: users[4], project: projects[5], status: ApplicationStatus.ACCEPTED }, // alex_rodriguez (FREELANCER)
      { user: users[5], project: projects[5], status: ApplicationStatus.PENDING }, // lisa_kim (FREELANCER)
    ];

    const applications = this.applicationRepository.create(applicationsData);
    await this.applicationRepository.save(applications);
  }

  private async seedTeams(users: User[], projects: Project[]): Promise<void> {
    this.logger.log('Seeding teams...', 'SeederService');

    const teamsData = [
      // === E-Commerce Platform Team (owned by yassen722) ===
      { project: projects[0], user: users[0], roleTitle: 'Project Lead' }, // yassen722 (LEADER/OWNER)
      { project: projects[0], user: users[2], roleTitle: 'Full-Stack Developer' }, // mohamed722 (FREELANCER - ACCEPTED)

      // === Mobile Fitness App Team (owned by yassen722) ===
      { project: projects[1], user: users[0], roleTitle: 'Project Lead' }, // yassen722 (LEADER/OWNER)
      { project: projects[1], user: users[4], roleTitle: 'Mobile Developer' }, // alex_rodriguez (FREELANCER - ACCEPTED)

      // === Educational Platform Team (owned by yassen722) ===
      { project: projects[2], user: users[0], roleTitle: 'Project Lead' }, // yassen722 (LEADER/OWNER)
      { project: projects[2], user: users[2], roleTitle: 'Full-Stack Developer' }, // mohamed722 (FREELANCER - ACCEPTED)

      // === AI Analytics Dashboard Team (owned by mike_chen) ===
      { project: projects[3], user: users[1], roleTitle: 'Project Lead' }, // mike_chen (LEADER/OWNER)
      { project: projects[3], user: users[5], roleTitle: 'ML Engineer' }, // lisa_kim (FREELANCER - ACCEPTED)

      // === Microservices Migration Team (owned by mike_chen) ===
      { project: projects[4], user: users[1], roleTitle: 'Project Lead' }, // mike_chen (LEADER/OWNER)
      { project: projects[4], user: users[6], roleTitle: 'DevOps Engineer' }, // david_johnson (FREELANCER - ACCEPTED)
      { project: projects[4], user: users[2], roleTitle: 'Backend Developer' }, // mohamed722 (FREELANCER - ACCEPTED)

      // === IoT Smart Home System Team (owned by mike_chen) ===
      { project: projects[5], user: users[1], roleTitle: 'Project Lead' }, // mike_chen (LEADER/OWNER)
      { project: projects[5], user: users[4], roleTitle: 'Mobile Developer' }, // alex_rodriguez (FREELANCER - ACCEPTED)
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