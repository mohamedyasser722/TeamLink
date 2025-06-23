import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'oldpassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'newpassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
} 