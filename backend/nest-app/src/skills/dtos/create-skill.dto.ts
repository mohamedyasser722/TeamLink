import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({
    description: 'Skill name',
    example: 'JavaScript',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
} 