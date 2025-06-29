import { IsString, IsNotEmpty, IsOptional, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProjectSkillDto } from './project-skill.dto';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project title',
    example: 'E-commerce Website Development',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Looking for developers to build a modern e-commerce platform',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

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