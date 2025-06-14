import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organization/entities/organization.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const department = this.departmentRepository.create({
      name: createDepartmentDto.name,
      description: createDepartmentDto.description,
      organization: { id: createDepartmentDto.organizationId }
    });

    if (createDepartmentDto.departmentHeadId) {
      const head = await this.userRepository.findOne({
        where: { id: createDepartmentDto.departmentHeadId }
      });
      if (!head) {
        throw new NotFoundException('Department head not found');
      }
      department.departmentHead = head;
    }

    return this.departmentRepository.save(department);
  }

  findAll() {
    return this.departmentRepository.find({
      relations: ['organization', 'departmentHead', 'employees']
    });
  }

  findByOrganization(organizationId: string) {
    return this.departmentRepository.find({
      where: { organization: { id: organizationId } },
      relations: ['organization', 'departmentHead', 'employees']
    });
  }

  async findOne(id: string) {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['organization', 'departmentHead', 'employees']
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.findOne(id);

    if (updateDepartmentDto.departmentHeadId) {
      const head = await this.userRepository.findOne({
        where: { id: updateDepartmentDto.departmentHeadId }
      });
      if (!head) {
        throw new NotFoundException('Department head not found');
      }
      department.departmentHead = head;
    }

    if (updateDepartmentDto.name) {
      department.name = updateDepartmentDto.name;
    }

    if (updateDepartmentDto.description !== undefined) {
      department.description = updateDepartmentDto.description;
    }

    return this.departmentRepository.save(department);
  }

  async remove(id: string) {
    const department = await this.findOne(id);
    return this.departmentRepository.remove(department);
  }

  async assignDepartmentHead(departmentId: string, userId: string) {
    const department = await this.findOne(departmentId);
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    department.departmentHead = user;
    return this.departmentRepository.save(department);
  }
} 