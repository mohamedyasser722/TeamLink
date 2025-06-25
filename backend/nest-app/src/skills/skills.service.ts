import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../entities/skill.entity';
import { CreateSkillDto } from './dtos/create-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
  ) {}

  async createSkill(createSkillDto: CreateSkillDto): Promise<Skill> {
    // Check if skill already exists
    const existingSkill = await this.skillRepository.findOne({
      where: { name: createSkillDto.name },
    });

    if (existingSkill) {
      throw new ConflictException('Skill already exists');
    }

    const skill = this.skillRepository.create(createSkillDto);
    return this.skillRepository.save(skill);
  }

  async findAllSkills(): Promise<Skill[]> {
    return this.skillRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findSkillById(id: string): Promise<Skill> {
    const skill = await this.skillRepository.findOne({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async deleteSkill(id: string): Promise<void> {
    const skill = await this.findSkillById(id);
    await this.skillRepository.remove(skill);
  }

  async searchSkills(query: string): Promise<Skill[]> {
    return this.skillRepository
      .createQueryBuilder('skill')
      .where('skill.name ILIKE :query', { query: `%${query}%` })
      .orderBy('skill.name', 'ASC')
      .getMany();
  }
} 