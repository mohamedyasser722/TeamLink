import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../../entities/enums/project-status.enum';

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
} 