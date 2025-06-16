import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Document } from './entities/document.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { AIService } from './services/ai.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([Document, Conversation, Message])
    ],
    controllers: [ChatController],
    providers: [ChatService, AIService],
    exports: [ChatService, AIService]
})
export class ChatModule {} 