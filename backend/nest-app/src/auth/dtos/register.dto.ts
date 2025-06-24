import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-roles.enum';

export class RegisterDto {
  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
  // role
  @ApiProperty({
    description: 'User role',
    example: 'user',
  })
  @IsEnum(UserRole)
  @IsString()
  role: string;

  @ApiProperty({
    description: 'User bio/description',
    example: 'Full-stack developer passionate about building great apps',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
} 