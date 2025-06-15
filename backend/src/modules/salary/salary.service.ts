import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salary } from './entities/salary.entity';

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(Salary)
    private salaryRepository: Repository<Salary>,
  ) {}

  findAll() {
    return this.salaryRepository.find({ relations: ['user'] });
  }

  findOne(id: string) {
    return this.salaryRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async create(data: Partial<Salary>) {
    const salary = this.salaryRepository.create(data);
    return this.salaryRepository.save(salary);
  }

  async update(id: string, data: Partial<Salary>) {
    const salary = await this.salaryRepository.findOne({ where: { id } });
    if (!salary) throw new NotFoundException('Salary not found');
    Object.assign(salary, data);
    return this.salaryRepository.save(salary);
  }

  async remove(id: string) {
    const salary = await this.salaryRepository.findOne({ where: { id } });
    if (!salary) throw new NotFoundException('Salary not found');
    return this.salaryRepository.remove(salary);
  }

  async findByUser(userId: string) {
    return this.salaryRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
} 