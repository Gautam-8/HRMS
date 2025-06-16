import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserDocument } from './entities/user_document.entity';
import { UserDocumentService } from './service/user-document.service';
import { UserDocumentController } from './controller/user-document.controller';
import { CloudinaryService } from 'src/common/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserDocument])],
  controllers: [UsersController, UserDocumentController],
  providers: [UsersService, UserDocumentService, CloudinaryService],
  exports: [UsersService],
})
export class UsersModule {} 