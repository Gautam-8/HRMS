import { Controller, Post, Body, UploadedFile, UseInterceptors, UseGuards, Request, MaxFileSizeValidator, FileTypeValidator, ParseFilePipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../users/entities/user.entity';

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocument(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: 'application/pdf' })
                ],
            }),
        )
        file: any,
        @Request() req
    ) {
        return this.chatService.processDocument(file.buffer, req.user.organizationId);
    }

    @Post('query')
    async handleQuery(
        @Body('query') query: string,
        @Request() req
    ) {
        return this.chatService.handleQuery(
            query,
            req.user.id,
            req.user.organizationId
        );
    }
} 