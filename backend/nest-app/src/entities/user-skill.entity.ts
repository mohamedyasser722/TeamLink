import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Skill } from './skill.entity';
import { SkillLevel } from './enums/skill-level.enum';

@Entity('user_skills')
@Index(['userId', 'skillId'], { unique: true })
export class UserSkill {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @PrimaryColumn({ type: 'uuid', name: 'skill_id' })
  skillId: string;

  @Column({
    type: 'enum',
    enum: SkillLevel,
  })
  level: SkillLevel;

  // Relationships
  @ManyToOne(() => User, (user) => user.userSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Skill, (skill) => skill.userSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
} 