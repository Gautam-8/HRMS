import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

export interface EmbeddingDocument {
    content: string;
    metadata?: Record<string, any>;
}

export interface SimilaritySearchResult {
    content: string;
    metadata: Record<string, any>;
    similarity: number;
}

export interface AIServiceOptions {
    systemPrompt?: string;
    temperature?: number;
    chunkSize?: number;
    chunkOverlap?: number;
    maxResults?: number;
    instructions?: string[];
}

@Injectable()
export class AIService {
    private readonly logger = new Logger(AIService.name);
    private genAI: GoogleGenerativeAI;
    private model: any; // Gemini model

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('ai.geminiApiKey');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set in environment variables');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ 
            model: this.configService.get<string>('ai.modelName') || 'gemini-1.5-flash'
        });
    }

    async processDocument(content: string, metadata: Record<string, any> = {}, options?: AIServiceOptions) {
        try {
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: options?.chunkSize || this.configService.get<number>('ai.chunkSize') || 1000,
                chunkOverlap: options?.chunkOverlap || this.configService.get<number>('ai.chunkOverlap') || 200
            });

            const chunks = await splitter.splitText(content);

            return chunks.map(chunk => new Document({
                pageContent: chunk,
                metadata: {
                    ...metadata,
                    title: metadata.title || 'Untitled Document',
                    timestamp: new Date().toISOString()
                }
            }));
        } catch (error) {
            this.logger.error('Error processing document', error);
            throw error;
        }
    }

    async generateEmbedding(text: string): Promise<number[]> {
        try {
            const embeddingModel = this.genAI.getGenerativeModel({ 
                model: this.configService.get<string>('ai.embeddingModel') || 'embedding-001'
            });
            const result = await embeddingModel.embedContent(text);
            return result.embedding.values;
        } catch (error) {
            this.logger.error('Error generating embedding', error);
            throw error;
        }
    }

    async findSimilarDocuments(
        query: string, 
        documents: EmbeddingDocument[], 
        options?: AIServiceOptions
    ): Promise<SimilaritySearchResult[]> {
        try {
            const queryEmbedding = await this.generateEmbedding(query);
            
            const similarities = await Promise.all(
                documents.map(async (doc) => {
                    const docEmbedding = await this.generateEmbedding(doc.content);
                    const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
                    return {
                        content: doc.content,
                        metadata: doc.metadata || {},
                        similarity
                    };
                })
            );

            return similarities
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, options?.maxResults || this.configService.get<number>('ai.maxResults') || 5);
        } catch (error) {
            this.logger.error('Error finding similar documents', error);
            throw error;
        }
    }

    async generateResponse(
        query: string, 
        context: string, 
        options?: AIServiceOptions
    ): Promise<string> {
        try {
            const defaultInstructions = [
                'Answer based on the provided context',
                'Be concise and clear',
                'If the answer is not in the context, say so',
                'Format response in markdown'
            ];

            const prompt = `
                ${options?.systemPrompt || 'You are an AI assistant. Use the provided context to answer:'}
                
                Context: ${context}
                
                Question: ${query}
                
                Instructions:
                ${(options?.instructions || defaultInstructions).map((instruction, i) => `${i + 1}. ${instruction}`).join('\n')}
            `;

            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: options?.temperature || this.configService.get<number>('ai.temperature') || 0.7,
                    maxOutputTokens: this.configService.get<number>('ai.maxTokens') || 2048
                }
            });

            return result.response.text();
        } catch (error) {
            this.logger.error('Error generating response', error);
            throw error;
        }
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }
} 