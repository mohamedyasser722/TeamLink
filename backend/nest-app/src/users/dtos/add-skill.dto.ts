import { IsUUID, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SkillLevel } from '../../entities/enums/skill-level.enum';

export class AddSkillDto {
  @ApiProperty({
    description: 'Skill ID',
    example: 'uuid-here',
  })
  @IsUUID()
  @IsNotEmpty()
  skillId: string;

  @ApiProperty({
    description: 'Skill proficiency level',
    enum: SkillLevel,
    example: SkillLevel.INTERMEDIATE,
  })
  @IsEnum(SkillLevel)
  @IsNotEmpty()
  level: SkillLevel;
} 