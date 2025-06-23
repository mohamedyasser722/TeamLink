import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserSkill } from './user-skill.entity';
import { Project } from './project.entity';
import { Application } from './application.entity';
import { Team } from './team.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'keycloak_id' })
  keycloakId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 320, unique: true, nullable: false })
  email: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'avatar_url' })
  avatarUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  // Relationships
  @OneToMany(() => UserSkill, (userSkill) => userSkill.user)
  userSkills: UserSkill[];

  @OneToMany(() => Project, (project) => project.owner)
  ownedProjects: Project[];

  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];

  @OneToMany(() => Team, (team) => team.user)
  teamMemberships: Team[];
} 