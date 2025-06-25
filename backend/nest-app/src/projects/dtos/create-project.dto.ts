import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
} 