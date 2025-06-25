import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../../entities/enums/application-status.enum';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: 'Application status',
    enum: ApplicationStatus,
    example: ApplicationStatus.ACCEPTED,
  })
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status: ApplicationStatus;

  @ApiProperty({
    description: 'Role title for the team member if accepted',
    example: 'Frontend Developer',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  roleTitle?: string;
} 