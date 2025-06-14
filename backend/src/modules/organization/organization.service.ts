import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    const queryRunner = this.organizationRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if organization with same PAN or GST exists
      const existingOrg = await this.organizationRepository.findOne({
        where: [
          { panNumber: createOrganizationDto.panNumber },
          { gstNumber: createOrganizationDto.gstNumber }
        ]
      });

      if (existingOrg) {
        throw new ConflictException('Organization with same PAN or GST already exists');
      }

      // Check if user email already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: createOrganizationDto.email }
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create organization
      const organization = this.organizationRepository.create({
        name: createOrganizationDto.name,
        description: createOrganizationDto.description,
        industry: createOrganizationDto.industry,
        legalName: createOrganizationDto.legalName,
        panNumber: createOrganizationDto.panNumber,
        gstNumber: createOrganizationDto.gstNumber,
      });

      const savedOrg = await queryRunner.manager.save(organization);

      // Hash password and create HR user
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createOrganizationDto.password, salt);
      
      const user = this.userRepository.create({
        fullName: createOrganizationDto.fullName,
        email: createOrganizationDto.email,
        password: hashedPassword,
        phone: createOrganizationDto.phone,
        designation: createOrganizationDto.designation,
        role: 'HR',
        organization: savedOrg
      });

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      return {
        message: 'Organization and HR user created successfully',
        organizationId: savedOrg.id
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating organization');
    } finally {
      await queryRunner.release();
    }
  }
} 