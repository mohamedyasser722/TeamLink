import { IsString, IsOptional, MaxLength, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProjectStatus } from '../../entities/enums/project-status.enum';
import { ProjectSkillDto } from './project-skill.dto';

export class UpdateProjectDto {
  @ApiProperty({
    description: 'Project title',
    example: 'E-commerce Website Development',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Looking for developers to build a modern e-commerce platform',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Project status',
    enum: ProjectStatus,
    required: false,
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({
    description: 'Required skills for the project',
    type: [ProjectSkillDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProjectSkillDto)
  requiredSkills?: ProjectSkillDto[];
} 