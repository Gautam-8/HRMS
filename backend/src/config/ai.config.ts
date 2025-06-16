import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  geminiApiKey: process.env.GEMINI_API_KEY,
  modelName: process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash',
  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'embedding-001',
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048', 10),
  chunkSize: parseInt(process.env.AI_CHUNK_SIZE || '1000', 10),
  chunkOverlap: parseInt(process.env.AI_CHUNK_OVERLAP || '200', 10),
  maxResults: parseInt(process.env.AI_MAX_RESULTS || '5', 10)
})); 