import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';

@Injectable()
export class LangchainService {
    private genAI: GoogleGenerativeAI;
    private model: any; // Gemini model

    constructor() {
        // Initialize Gemini
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    async processDocument(content: string) {
        // Split text into chunks
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200
        });

        const chunks = await splitter.splitText(content);

        // Create documents with metadata
        const documents = chunks.map(chunk => new Document({
            pageContent: chunk,
            metadata: {
                source: 'hr_policy',
                timestamp: new Date().toISOString()
            }
        }));

        return documents;
    }

    async generateResponse(query: string, context: string) {
        const prompt = `
            You are an HR assistant. Use these policies to answer:
            
            Context: ${context}
            
            Question: ${query}
            
            Instructions:
            1. Answer based on the provided policies
            2. Be concise and clear
            3. If the answer is not in the policies, say so
            4. Format response in markdown
        `;

        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }

    async generateEmbedding(text: string) {
        const embeddingModel = this.genAI.getGenerativeModel({ model: 'embedding-001' });
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    }

    async findSimilarDocuments(query: string, documents: Document[]) {
        const queryEmbedding = await this.generateEmbedding(query);
        
        // Calculate similarity scores
        const similarities = await Promise.all(
            documents.map(async (doc) => {
                const docEmbedding = await this.generateEmbedding(doc.pageContent);
                const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
                return { doc, similarity };
            })
        );

        // Sort by similarity and return top matches
        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5)
            .map(item => item.doc);
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }
} 