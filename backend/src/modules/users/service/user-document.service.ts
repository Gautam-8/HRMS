import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDocument } from '../entities/user_document.entity';
import { CreateUserDocumentDto } from '../dto/create-user-document.dto';

@Injectable()
export class UserDocumentService {
  constructor(
    @InjectRepository(UserDocument)
    private readonly userDocumentRepository: Repository<UserDocument>,
  ) {}

  async create(createUserDocumentDto: CreateUserDocumentDto): Promise<UserDocument> {
    const document = this.userDocumentRepository.create(createUserDocumentDto);
    return this.userDocumentRepository.save(document);
  }

  async findAll(userId: string): Promise<UserDocument[]> {
    return this.userDocumentRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
} 