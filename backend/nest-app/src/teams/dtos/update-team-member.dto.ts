import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeamMemberDto {
  @ApiProperty({
    description: 'Role title for the team member',
    example: 'Senior Frontend Developer',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  roleTitle: string;
} 