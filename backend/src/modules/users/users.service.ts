import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const { departmentId, organizationId, ...userData } = createUserDto;
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      isOnboarded: false,
      department: departmentId ? { id: departmentId } : undefined,
      organization: organizationId ? { id: organizationId } : undefined,
    });

    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find({
      relations: ['organization', 'department'],
    });
  }

  findOne(id: string) {
    return this.userRepository.findOne({ 
      where: { id },
      relations: ['organization', 'department'],
    });
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({ 
      where: { email },
      relations: ['organization', 'department'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { departmentId, organizationId, ...updateData } = updateUserDto;
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await this.userRepository.update(id, {
      ...updateData,
      department: departmentId ? { id: departmentId } : undefined,
      organization: organizationId ? { id: organizationId } : undefined,
    });
    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userRepository.remove(user);
  }

  async findManagersByOrganization(organizationId: string) {
    if (!organizationId) {
      throw new NotFoundException('Organization ID is required');
    }

    return this.userRepository.find({
      where: {
        organization: { id: organizationId },
        role: 'Manager',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        designation: true,
      },
      relations: ['organization'],
    });
  }

  async isManagerOf(managerId: string, employeeId: string): Promise<boolean> {
    const employee = await this.userRepository.findOne({
      where: { id: employeeId },
      relations: ['department', 'department.departmentHead']
    });

    if (!employee) {
      return false;
    }

    // Check if the manager is the department head
    if (employee.department?.departmentHead?.id === managerId) {
      return true;
    }

    return false;
  }

  async findTeamMembers(managerId: string) {
    // First find the manager's department
    const manager = await this.userRepository.findOne({
      where: { id: managerId },
      relations: ['departmentsManaged'],
    });

    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    // Get all employees in the departments managed by this manager
    const employees = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
      .where('department.departmentHead = :managerId', { managerId })
      .select([
        'user.id',
        'user.fullName',
        'user.email',
        'user.designation',
        'user.role',
        'department.id',
        'department.name',
      ])
      .getMany();

    return employees;
  }
} 