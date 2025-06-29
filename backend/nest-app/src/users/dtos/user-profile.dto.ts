import { ApiProperty } from '@nestjs/swagger';
import { SkillLevel } from '../../entities/enums/skill-level.enum';

export class UserSkillProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: SkillLevel })
  level: SkillLevel;
}

export class UserRatingDto {
  @ApiProperty()
  rating: number;

  @ApiProperty()
  comment: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  raterUsername: string;

  @ApiProperty()
  projectTitle: string;
}

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  bio: string;

  @ApiProperty()
  avatarUrl: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [UserSkillProfileDto] })
  skills: UserSkillProfileDto[];

  @ApiProperty({ type: [UserRatingDto] })
  ratings: UserRatingDto[];

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  totalRatings: number;
} 