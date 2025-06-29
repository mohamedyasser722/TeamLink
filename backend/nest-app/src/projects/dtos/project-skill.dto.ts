import { IsUUID, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SkillLevel } from '../../entities/enums/skill-level.enum';

export class ProjectSkillDto {
  @ApiProperty({
    description: 'Skill ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  skillId: string;

  @ApiProperty({
    description: 'Required skill level for the project',
    enum: SkillLevel,
    example: SkillLevel.INTERMEDIATE,
  })
  @IsEnum(SkillLevel)
  @IsNotEmpty()
  requiredLevel: SkillLevel;
} 