import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google OAuth authorization code',
    example: '4/0AX4XfWh...',
  })
  @IsString()
  code: string;
} 