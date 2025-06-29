import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Application } from './application.entity';
import { Team } from './team.entity';
import { ProjectSkill } from './project-skill.entity';
import { Rating } from './rating.entity';
import { ProjectStatus } from './enums/project-status.enum';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.OPEN,
  })
  status: ProjectStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.ownedProjects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Application, (application) => application.project)
  applications: Application[];

  @OneToMany(() => Team, (team) => team.project)
  team: Team[];

  @OneToMany(() => ProjectSkill, (projectSkill) => projectSkill.project)
  projectSkills: ProjectSkill[];

  @OneToMany(() => Rating, (rating) => rating.project)
  ratings: Rating[];
} 