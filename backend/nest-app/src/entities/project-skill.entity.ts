import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from './project.entity';
import { Skill } from './skill.entity';
import { SkillLevel } from './enums/skill-level.enum';

@Entity('project_skills')
@Index(['projectId', 'skillId'], { unique: true })
export class ProjectSkill {
  @PrimaryColumn({ type: 'uuid', name: 'project_id' })
  projectId: string;

  @PrimaryColumn({ type: 'uuid', name: 'skill_id' })
  skillId: string;

  @Column({
    type: 'enum',
    enum: SkillLevel,
    name: 'required_level',
  })
  requiredLevel: SkillLevel;

  // Relationships
  @ManyToOne(() => Project, (project) => project.projectSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Skill, (skill) => skill.projectSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
} 