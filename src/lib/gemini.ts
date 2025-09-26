import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';
import { embeddingRateLimiter, generationRateLimiter } from './rate-limiter';

if (!config.googleApiKey) {
  throw new Error('GOOGLE_API_KEY is not configured');
}

const genAI = new GoogleGenerativeAI(config.googleApiKey);

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Wait for rate limiter before making request
    await embeddingRateLimiter.waitForAvailability();

    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent(text);

    if (!result.embedding?.values) {
      throw new Error('No embedding values received from model');
    }

    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateResponse(prompt: string): Promise<string> {
  try {
    // Wait for rate limiter before making request
    await generationRateLimiter.waitForAvailability();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No text response received from model');
    }

    return text;
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
}