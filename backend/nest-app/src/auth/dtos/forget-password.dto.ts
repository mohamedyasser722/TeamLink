import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgetPasswordDto {
  @ApiProperty({
    description: 'User email address for password reset',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
} 