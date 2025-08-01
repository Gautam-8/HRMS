import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Document } from './entities/document.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { AIService } from './services/ai.service';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class ChatService {
    private readonly MAX_REQUESTS_PER_MINUTE = 30;
    private readonly CONVERSATION_RETENTION_DAYS = 30;
    private requestCounts: Map<string, { count: number; timestamp: number }> = new Map();

    constructor(
        @InjectRepository(Document)
        private documentRepository: Repository<Document>,
        @InjectRepository(Conversation)
        private conversationRepository: Repository<Conversation>,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        private aiService: AIService
    ) {
        // Start conversation cleanup job
        this.startCleanupJob();
    }

    private async startCleanupJob() {
        setInterval(async () => {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - this.CONVERSATION_RETENTION_DAYS);

            await this.conversationRepository.delete({
                createdAt: LessThan(cutoffDate)
            });
        }, 24 * 60 * 60 * 1000); // Run daily
    }

    private checkRateLimit(userId: string): boolean {
        const now = Date.now();
        const userRequests = this.requestCounts.get(userId);

        if (!userRequests || now - userRequests.timestamp > 60000) {
            this.requestCounts.set(userId, { count: 1, timestamp: now });
            return true;
        }

        if (userRequests.count >= this.MAX_REQUESTS_PER_MINUTE) {
            return false;
        }

        userRequests.count++;
        return true;
    }

    async processDocument(file: Buffer, organizationId: string) {
        try {
            // Extract text from PDF
            const data = await pdfParse(file);
            const content = data.text;

            // Process document with AI Service
            const documents = await this.aiService.processDocument(content, {
                title: 'HR Policy',
                organizationId
            });

            // Generate embeddings and save documents
            for (const doc of documents) {
                const embedding = await this.aiService.generateEmbedding(doc.pageContent);
                
                await this.documentRepository.save({
                    title: doc.metadata.title,
                    content: doc.pageContent,
                    embedding,
                    organizationId
                });
            }

            return { success: true, message: 'Document processed successfully' };
        } catch (error) {
            console.error('Error processing document:', error);
            throw new HttpException('Failed to process document', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async handleQuery(query: string, userId: string, organizationId: string) {
        try {
            if (!this.checkRateLimit(userId)) {
                throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
            }

            // Get or create conversation
            let conversation = await this.conversationRepository.findOne({
                where: { userId, organizationId },
                order: { createdAt: 'DESC' }
            });

            if (!conversation) {
                conversation = await this.conversationRepository.save({
                    userId,
                    organizationId
                });
            }

            // Save user message
            await this.messageRepository.save({
                conversationId: conversation.id,
                content: query,
                role: 'user'
            });

            // Get all documents for the organization
            const documents = await this.documentRepository.find({
                where: { organizationId }
            });

            if (documents.length === 0) {
                return "I don't have any policies to reference. Please upload some HR policies first.";
            }

            // Find relevant documents using AI Service
            const relevantDocs = await this.aiService.findSimilarDocuments(
                query,
                documents.map(doc => ({
                    content: doc.content,
                    metadata: { title: doc.title }
                }))
            );

            // Generate response using AI Service
            const context = relevantDocs
                .map(doc => `Title: ${doc.metadata.title}\nContent: ${doc.content}`)
                .join('\n\n');

            const response = await this.aiService.generateResponse(query, context, {
                systemPrompt: 'You are an HR assistant. Use these policies to answer:',
                instructions: [
                    'Answer based on the provided HR policies',
                    'Be concise and clear',
                    'If the answer is not in the policies, say so',
                    'Format response in markdown',
                    'Include relevant policy references when possible'
                ]
            });

            // Save assistant message
            await this.messageRepository.save({
                conversationId: conversation.id,
                content: response,
                role: 'assistant'
            });

            return response;
        } catch (error) {
            console.error('Error handling query:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Failed to process query', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 