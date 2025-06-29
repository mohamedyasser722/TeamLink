import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../../entities/enums/project-status.enum';
import { SkillLevel } from '../../entities/enums/skill-level.enum';

export class ProjectSkillMatchDto {
  @ApiProperty()
  skillName: string;

  @ApiProperty({ enum: SkillLevel })
  requiredLevel: SkillLevel;

  @ApiProperty({ enum: SkillLevel, nullable: true })
  userLevel: SkillLevel | null;

  @ApiProperty()
  isMatch: boolean;
}

export class ProjectOwnerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  avatarUrl: string;
}

export class ProjectMatchDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: ProjectStatus })
  status: ProjectStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  owner: ProjectOwnerDto;

  @ApiProperty({ type: [ProjectSkillMatchDto] })
  skillMatches: ProjectSkillMatchDto[];

  @ApiProperty()
  matchPercentage: number;

  @ApiProperty()
  totalRequiredSkills: number;

  @ApiProperty()
  matchedSkills: number;
} 