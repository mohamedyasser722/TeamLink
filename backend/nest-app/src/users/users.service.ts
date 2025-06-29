import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSkill } from '../entities/user-skill.entity';
import { Skill } from '../entities/skill.entity';
import { Rating } from '../entities/rating.entity';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { AddSkillDto } from './dtos/add-skill.dto';
import { UserProfileDto } from './dtos/user-profile.dto';
import { AuthenticatedUser } from 'nest-keycloak-connect';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSkill)
    private userSkillRepository: Repository<UserSkill>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
  ) {}

  async getOrCreateUser(keycloakUser: any): Promise<User> {
    let user = await this.userRepository.findOne({ 
      where: { keycloakId: keycloakUser.sub },
    });

    if (!user) {
      // If user doesn't exist, create new user
      const newUser = this.userRepository.create({
        keycloakId: keycloakUser.sub,
        username: keycloakUser.preferred_username || keycloakUser.email.split('@')[0],
        email: keycloakUser.email,
        lastLoginAt: new Date(),
        isActive: true,
      });
      user = await this.userRepository.save(newUser);
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
    }

    return user;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userSkills', 'userSkills.skill'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['userSkills', 'userSkills.skill'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(keycloakUser: any, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.getOrCreateUser(keycloakUser);
    
    Object.assign(user, updateProfileDto);
    user.lastLoginAt = new Date();
    
    return this.userRepository.save(user);
  }

  async addSkillToUser(keycloakUser: any, addSkillDto: AddSkillDto): Promise<UserSkill> {
    const user = await this.getOrCreateUser(keycloakUser);
    
    const skill = await this.skillRepository.findOne({
      where: { id: addSkillDto.skillId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    // Check if user already has this skill
    const existingUserSkill = await this.userSkillRepository.findOne({
      where: { userId: user.id, skillId: addSkillDto.skillId },
    });

    if (existingUserSkill) {
      // Update existing skill level
      existingUserSkill.level = addSkillDto.level;
      return this.userSkillRepository.save(existingUserSkill);
    }

    // Create new user skill
    const userSkill = this.userSkillRepository.create({
      userId: user.id,
      skillId: addSkillDto.skillId,
      level: addSkillDto.level,
    });

    return this.userSkillRepository.save(userSkill);
  }

  async removeSkillFromUser(keycloakUser: any, skillId: string): Promise<void> {
    const user = await this.getOrCreateUser(keycloakUser);
    
    const userSkill = await this.userSkillRepository.findOne({
      where: { userId: user.id, skillId },
    });

    if (!userSkill) {
      throw new NotFoundException('User skill not found');
    }

    await this.userSkillRepository.remove(userSkill);
  }

  async getUserSkills(userId: string): Promise<UserSkill[]> {
    return this.userSkillRepository.find({
      where: { userId },
      relations: ['skill'],
    });
  }

  async getMySkills(keycloakUser: any): Promise<UserSkill[]> {
    const user = await this.getOrCreateUser(keycloakUser);
    return this.getUserSkills(user.id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      where: { isActive: true },
      relations: ['userSkills', 'userSkills.skill'],
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        userSkills: {
          level: true,
          skill: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getUserProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userSkills', 'userSkills.skill', 'receivedRatings', 'receivedRatings.rater', 'receivedRatings.project'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate average rating
    const ratings = user.receivedRatings || [];
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
      : 0;

    // Format skills
    const skills = user.userSkills?.map(userSkill => ({
      id: userSkill.skill.id,
      name: userSkill.skill.name,
      level: userSkill.level,
    })) || [];

    // Format ratings
    const formattedRatings = ratings.map(rating => ({
      rating: rating.rating,
      comment: rating.comment,
      createdAt: rating.createdAt,
      raterUsername: rating.rater.username,
      projectTitle: rating.project.title,
    }));

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      skills,
      ratings: formattedRatings,
      averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
      totalRatings: ratings.length,
    };
  }
} 