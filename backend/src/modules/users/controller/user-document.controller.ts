import { Controller, Post, Body, Get, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserDocumentService } from '../service/user-document.service';
import { CreateUserDocumentDto } from '../dto/create-user-document.dto';
import { File as MulterFile } from 'multer';
import { CloudinaryService } from 'src/common/cloudinary.service';

@Controller('user-documents')
export class UserDocumentController {
  constructor(
    private readonly userDocumentService: UserDocumentService, 
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() body: CreateUserDocumentDto,
    @UploadedFile() file: MulterFile
  ) {
    if (!file) {
      throw new Error('File is required');
    }
    const url = await this.cloudinaryService.uploadFile(file.buffer, file.originalname);
    const doc = await this.userDocumentService.create({
      ...body,
      link: url
    });
    return doc;
  }

  @Get(':userId')
  async findAll(@Param('userId') userId: string) {
    return this.userDocumentService.findAll(userId);
  }
} 